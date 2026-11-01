import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { FEW_SHOT_EXAMPLES } from './src/data/fewShotExamples.ts';
import {
  ClassificationResult,
  ResearchQuestionsResult,
  OutlineResult,
  StructuredPaperDraft,
  PeerReviewResult,
  PaperRequest,
  StageId
} from './src/types/research.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get or validate Google GenAI client
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured. Please ensure it is set in Settings > Secrets or your environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Model hierarchy: Use currently available and fast 'gemini-3.1-flash-lite' as primary,
// with graceful fallback to 'gemini-flash-latest' and 'gemini-3.8-flash'.
const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-3.8-flash'];

// Utility sleep with jitter
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Check if error is transient (503 UNAVAILABLE or 429 RATE LIMIT or temporary network spike)
function isTransientError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.statusCode || error.code;
  const message = (error.message || '').toLowerCase();
  const details = (error.errorDetails || '').toString().toLowerCase();

  return (
    status === 503 ||
    status === 429 ||
    status === 'UNAVAILABLE' ||
    status === 'RESOURCE_EXHAUSTED' ||
    message.includes('503') ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('overloaded') ||
    message.includes('spikes in demand') ||
    message.includes('429') ||
    message.includes('resource exhausted') ||
    message.includes('rate limit') ||
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('timeout') ||
    details.includes('unavailable') ||
    details.includes('high demand')
  );
}

// Clean and user-friendly error message formatter
function formatErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  const msg = error.message || error.toString();

  if (msg.includes('GEMINI_API_KEY')) {
    return 'Gemini API key is missing. Please check your GEMINI_API_KEY in Settings > Secrets.';
  }
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return 'Permission denied or invalid API key. Please check your API key in Settings > Secrets.';
  }
  if (isTransientError(error)) {
    return 'The Gemini service is temporarily experiencing high demand (HTTP 503/429). Automatic retries were attempted. Please try again in a few moments.';
  }
  if (msg.includes('JSON')) {
    return 'The model response could not be parsed into the expected academic schema. Please re-run the stage.';
  }
  return msg.replace(/[\n\r]+/g, ' ').slice(0, 250);
}

// Robust execution wrapper with max 3 retries, exponential backoff, and model fallback
async function executeWithRetryAndFallback<T>(
  action: (modelName: string) => Promise<T>,
  stageName: string
): Promise<{ result: T; modelUsed: string }> {
  const modelCandidates = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (const model of modelCandidates) {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[${stageName}] Attempt ${attempt}/${maxRetries} using model: ${model}`);
        const result = await action(model);
        return { result, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        console.warn(`[${stageName}] Error on attempt ${attempt} with ${model}:`, err?.message || err);

        const isTransient = isTransientError(err);
        if (isTransient && attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s + jitter
          const baseDelay = 1000 * Math.pow(2, attempt - 1);
          const jitter = Math.floor(Math.random() * 500);
          const totalDelay = baseDelay + jitter;
          console.log(`[${stageName}] Backing off for ${totalDelay}ms before retry...`);
          await sleep(totalDelay);
          continue;
        }

        // If not transient or last attempt for this model, break to try fallback model
        break;
      }
    }
    console.warn(`[${stageName}] Model ${model} unavailable or exhausted retries. Attempting next fallback model...`);
  }

  // If all models and retries failed, throw formatted error
  throw new Error(formatErrorMessage(lastError));
}

// Clean JSON response from model text if wrapped in markdown code fence
function extractJson<T>(rawText: string | undefined): T {
  if (!rawText) {
    throw new Error('Model returned an empty response.');
  }
  let clean = rawText.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(clean) as T;
}

// -----------------------------------------------------------------------------
// MINIMAL DIAGNOSTIC TEST ENDPOINT
// Tests a minimal generation request to verify model availability in <2 seconds
// -----------------------------------------------------------------------------
async function runDiagnosticTest(ai: GoogleGenAI): Promise<{
  success: boolean;
  model: string;
  latencyMs: number;
  message: string;
}> {
  const startTime = Date.now();
  const { result, modelUsed } = await executeWithRetryAndFallback(async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: 'Respond with exactly: "ScholarForge AI model connection verified successfully."'
    });
    return response.text?.trim() || 'OK';
  }, 'DiagnosticTest');

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    model: modelUsed,
    latencyMs,
    message: result
  };
}

// -----------------------------------------------------------------------------
// STAGE 1: Topic Classification & Scope Analysis
// -----------------------------------------------------------------------------
async function runClassificationStage(ai: GoogleGenAI, request: PaperRequest): Promise<{ data: ClassificationResult; summary: string }> {
  const prompt = `You are a Senior Academic Research Director.
Perform an in-depth academic classification and scope feasibility assessment for the following research topic:

Topic: "${request.topic}"
Academic Field: "${request.field}"
Target Paper Length: "${request.length}"
Methodology Preference: "${request.methodologyPreference || 'Unspecified (recommend the most rigorous)'}"
Custom Notes: "${request.customNotes || 'None'}"

Provide a structured academic taxonomy including:
1. Primary discipline and granular subfield.
2. Recommended methodological paradigm.
3. Target scholarly audience and peer journals.
4. Key theoretical frameworks (at least 3 established theories or conceptual models).
5. Crucial academic key terms.
6. Feasibility and scope boundary assessment.`;

  const { result: responseText, modelUsed } = await executeWithRetryAndFallback(async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite academic taxonomist and research director. Return strictly valid JSON adhering to the specified schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            discipline: { type: Type.STRING },
            subfield: { type: Type.STRING },
            methodologicalParadigm: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            theoreticalFrameworks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            keyTerms: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            feasibilityAssessment: { type: Type.STRING }
          },
          required: ['discipline', 'subfield', 'methodologicalParadigm', 'targetAudience', 'theoreticalFrameworks', 'keyTerms', 'feasibilityAssessment']
        }
      }
    });
    return response.text;
  }, 'Stage1-Classification');

  const data = extractJson<ClassificationResult>(responseText);
  const summary = `Classified into ${data.discipline} (${data.subfield}) under a ${data.methodologicalParadigm} paradigm with ${data.theoreticalFrameworks.length} theoretical frameworks identified. [via ${modelUsed}]`;
  return { data, summary };
}

// -----------------------------------------------------------------------------
// STAGE 2: Research Questions & Working Hypotheses
// -----------------------------------------------------------------------------
async function runResearchQuestionsStage(
  ai: GoogleGenAI,
  request: PaperRequest,
  classification: ClassificationResult
): Promise<{ data: ResearchQuestionsResult; summary: string }> {
  const prompt = `You are an Academic Principal Investigator.
Formulate precise, empirically falsifiable research questions and working hypotheses for the research proposal.

Topic: "${request.topic}"
Field: "${request.field}" (${classification.subfield})
Paradigm: "${classification.methodologicalParadigm}"
Theoretical Frameworks: ${classification.theoreticalFrameworks.join(', ')}

Requirements:
- One overarching Primary Research Question (RQ1).
- 3 focused Secondary Questions addressing mechanisms, boundary conditions, or comparative metrics.
- 2 formal Hypotheses (H1, H2) with clear theoretical rationale.
- Explicit operationalization of variables: Independent, Dependent, and Controlled / Intervening variables.`;

  const { result: responseText, modelUsed } = await executeWithRetryAndFallback(async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: 'You are a rigorous academic scientist. Return strictly valid JSON adhering to the specified schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryQuestion: { type: Type.STRING },
            secondaryQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            hypotheses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hypothesisCode: { type: Type.STRING },
                  statement: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                },
                required: ['hypothesisCode', 'statement', 'rationale']
              }
            },
            variables: {
              type: Type.OBJECT,
              properties: {
                independent: { type: Type.ARRAY, items: { type: Type.STRING } },
                dependent: { type: Type.ARRAY, items: { type: Type.STRING } },
                controlledOrIntervening: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['independent', 'dependent', 'controlledOrIntervening']
            }
          },
          required: ['primaryQuestion', 'secondaryQuestions', 'hypotheses', 'variables']
        }
      }
    });
    return response.text;
  }, 'Stage2-ResearchQuestions');

  const data = extractJson<ResearchQuestionsResult>(responseText);
  const summary = `Formulated 1 primary RQ, ${data.secondaryQuestions.length} secondary RQs, ${data.hypotheses.length} formal hypotheses, and mapped core operational variables. [via ${modelUsed}]`;
  return { data, summary };
}

// -----------------------------------------------------------------------------
// STAGE 3: Academic Outline & Structural Roadmap
// -----------------------------------------------------------------------------
async function runOutlineStage(
  ai: GoogleGenAI,
  request: PaperRequest,
  classification: ClassificationResult,
  rqs: ResearchQuestionsResult
): Promise<{ data: OutlineResult; summary: string }> {
  const prompt = `You are an Academic Journal Editor and Structural Architect.
Develop a rigorous, section-by-section outline for a scholarly research paper.

Topic: "${request.topic}"
Discipline: "${classification.discipline} - ${classification.subfield}"
Primary Research Question: "${rqs.primaryQuestion}"
Target Length: "${request.length}"

Structure must encompass:
1. Introduction & Background
2. Theoretical Framework & Literature Review
3. Methodology & Experimental / Analytical Protocol
4. Findings & Discussion
5. Conclusion, Policy / Practical Implications & Future Work

For each section provide the title, core academic focus, specific subsections, and analytical key points.`;

  const { result: responseText, modelUsed } = await executeWithRetryAndFallback(async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic structural architect. Return strictly valid JSON adhering to the specified schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            methodologicalRoadmap: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.STRING },
                  title: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  subsections: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['number', 'title', 'focus', 'subsections', 'keyPoints']
              }
            }
          },
          required: ['executiveSummary', 'methodologicalRoadmap', 'sections']
        }
      }
    });
    return response.text;
  }, 'Stage3-Outline');

  const data = extractJson<OutlineResult>(responseText);
  const totalSubsections = data.sections.reduce((acc, s) => acc + (s.subsections?.length || 0), 0);
  const summary = `Structured ${data.sections.length} core sections with ${totalSubsections} granular subsections and methodological trajectory. [via ${modelUsed}]`;
  return { data, summary };
}

// -----------------------------------------------------------------------------
// STAGE 4: Structured Paper Drafting with FEW-SHOT PROMPTING
// -----------------------------------------------------------------------------
async function runDraftStage(
  ai: GoogleGenAI,
  request: PaperRequest,
  classification: ClassificationResult,
  rqs: ResearchQuestionsResult,
  outline: OutlineResult
): Promise<{ data: StructuredPaperDraft; summary: string }> {
  // Build few-shot demonstration context from FEW_SHOT_EXAMPLES
  const fewShotContext = FEW_SHOT_EXAMPLES.map((ex, idx) => {
    return `### FEW-SHOT EXAMPLE ${idx + 1}:
Topic: "${ex.topic}"
Field: "${ex.field}"
OUTPUT FORMAT AND DEPTH SPECIMEN:
{
  "title": "${ex.draft.title.replace(/"/g, '\\"')}",
  "abstract": "${ex.draft.abstract.replace(/"/g, '\\"')}",
  "keywords": ${JSON.stringify(ex.draft.keywords)},
  "introduction": "${ex.draft.introduction.slice(0, 400).replace(/"/g, '\\"')}... [Full academic prose continued]",
  "researchObjectives": "${ex.draft.researchObjectives.slice(0, 300).replace(/"/g, '\\"')}...",
  "literatureReview": "${ex.draft.literatureReview.slice(0, 450).replace(/"/g, '\\"')}... [Seminal real scholarship synthesis]",
  "methodology": "${ex.draft.methodology.slice(0, 450).replace(/"/g, '\\"')}...",
  "findings": "${ex.draft.findings.slice(0, 450).replace(/"/g, '\\"')}... [Quantitative and qualitative evidence]",
  "conclusion": "${ex.draft.conclusion.slice(0, 400).replace(/"/g, '\\"')}...",
  "references": ${JSON.stringify(ex.draft.references.slice(0, 5))}
}`;
  }).join('\n\n');

  const lengthGuidance = request.length === 'comprehensive'
    ? 'Comprehensive journal length (~3,500 - 5,000 words target depth across sections). Provide extensive academic arguments, deep methodology, and extensive literature synthesis.'
    : request.length === 'brief'
    ? 'Concise research note / brief communication (~1,500 - 2,000 words target depth). Crisp, high-density academic prose.'
    : 'Standard conference / journal article length (~2,500 - 3,200 words target depth). Balanced, rigorous academic treatment.';

  const prompt = `You are a distinguished Academic Scholar and Lead Author in ${classification.discipline}.
Write a complete, structured, publication-grade research paper.

### FEW-SHOT DEMONSTRATIONS:
Review the following two few-shot examples carefully. Emulate their formal scholarly register, dense factual exposition, authentic citation styling (author, year), and structured section separation.

${fewShotContext}

### CURRENT PAPER TARGET:
Topic: "${request.topic}"
Field: "${request.field}" (${classification.subfield})
Methodological Paradigm: "${classification.methodologicalParadigm}"
Length Guidance: ${lengthGuidance}
Primary Research Question: "${rqs.primaryQuestion}"
Hypotheses: ${rqs.hypotheses.map(h => `${h.hypothesisCode}: ${h.statement}`).join(' | ')}
Variables: Independent: ${rqs.variables.independent.join(', ')}; Dependent: ${rqs.variables.dependent.join(', ')}
Outline Plan: ${outline.sections.map(s => `${s.number}. ${s.title}`).join(' -> ')}
Methodology Roadmap: "${outline.methodologicalRoadmap}"
Author Notes: "${request.customNotes || 'N/A'}"

### STRICT ACADEMIC REQUIREMENTS:
1. Title: Informative, scholarly, and definitive.
2. Abstract: Structured scholarly abstract (~200-300 words: Background, Objective, Methodology, Results, Significance).
3. Keywords: 5-8 precise scholarly terms.
4. Introduction: Multi-paragraph deep scholarly introduction establishing domain context, theoretical tension, gap in current knowledge, and paper roadmap.
5. Research Objectives: Explicit formal delineation of primary & secondary objectives and testable hypotheses.
6. Literature Review: Thorough thematic synthesis of historical foundations, current state-of-the-art, and theoretical dialectic. Cite recognized foundational authors and paradigms in the discipline.
7. Methodology: Detailed, reproducible academic protocol (study design, datasets or sample cohort, instruments or architectures, control procedures, and statistical/inferential validation).
8. Findings: Comprehensive analysis with specific quantitative metrics, comparative baselines, statistical significance considerations, and analytical interpretations.
9. Conclusion: Synthesis of findings, theoretical and practical implications, explicit methodological limitations, and future research trajectories.
10. References: 10-15 peer-reviewed citations in standard APA/IEEE academic format using authentic, seminal literature in the field. Do not invent fictitious citations.`;

  const { result: responseText, modelUsed } = await executeWithRetryAndFallback(async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite academic researcher. Generate an exhaustive, publication-quality scholarly paper with authentic academic tone and rigor. Return valid JSON only.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            abstract: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            introduction: { type: Type.STRING },
            researchObjectives: { type: Type.STRING },
            literatureReview: { type: Type.STRING },
            methodology: { type: Type.STRING },
            findings: { type: Type.STRING },
            conclusion: { type: Type.STRING },
            references: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            'title',
            'abstract',
            'keywords',
            'introduction',
            'researchObjectives',
            'literatureReview',
            'methodology',
            'findings',
            'conclusion',
            'references'
          ]
        }
      }
    });
    return response.text;
  }, 'Stage4-Drafting');

  const draft = extractJson<StructuredPaperDraft>(responseText);

  // Compute word count
  const allText = [
    draft.title,
    draft.abstract,
    draft.introduction,
    draft.researchObjectives,
    draft.literatureReview,
    draft.methodology,
    draft.findings,
    draft.conclusion
  ].join(' ');
  const wordCount = allText.trim().split(/\s+/).filter(Boolean).length;
  draft.wordCount = wordCount;

  const summary = `Generated complete publication draft (${wordCount.toLocaleString()} words) across all 10 required academic sections with ${draft.references.length} peer-reviewed references. [via ${modelUsed}]`;
  return { data: draft, summary };
}

// -----------------------------------------------------------------------------
// STAGE 5: Peer Review & Rigor Evaluation
// -----------------------------------------------------------------------------
async function runPeerReviewStage(
  ai: GoogleGenAI,
  request: PaperRequest,
  draft: StructuredPaperDraft,
  classification: ClassificationResult
): Promise<{ data: PeerReviewResult; summary: string }> {
  const prompt = `You are a Senior Peer Reviewer for a Tier-1 academic journal in ${classification.discipline}.
Conduct an objective, rigorous, double-blind peer review of the drafted research paper.

Paper Title: "${draft.title}"
Abstract: "${draft.abstract}"
Methodology Excerpt: "${draft.methodology.slice(0, 1500)}"
Findings Excerpt: "${draft.findings.slice(0, 1500)}"
Conclusion Excerpt: "${draft.conclusion.slice(0, 1000)}"

Evaluate the paper across:
1. Recommendation: Choose from 'Accept', 'Accept with Minor Revisions', 'Revise and Resubmit', or 'Reject'.
2. Overall Score (1.0 to 10.0 scale, where 9.0+ is top tier conference/journal standard).
3. Criteria Scores (1-10 for Methodological Rigor, Theoretical Depth, Structural Clarity, and Literature Synthesis).
4. Key Strengths (3 distinct scholarly advantages).
5. Suggested Revisions (3 specific, actionable recommendations for improvement).
6. Ethical & Governance Considerations (reproducibility, bias, participant/ecological protection).
7. Concluding Remarks for the editorial board.`;

  const { result: responseText, modelUsed } = await executeWithRetryAndFallback(async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: 'You are an exacting academic journal referee. Provide constructive, incisive, and rigorous peer review. Return strictly valid JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: {
              type: Type.STRING,
              enum: ['Accept', 'Accept with Minor Revisions', 'Revise and Resubmit', 'Reject']
            },
            overallScore: { type: Type.NUMBER },
            criteriaScores: {
              type: Type.OBJECT,
              properties: {
                methodologicalRigor: { type: Type.NUMBER },
                theoreticalDepth: { type: Type.NUMBER },
                structuralClarity: { type: Type.NUMBER },
                literatureSynthesis: { type: Type.NUMBER }
              },
              required: ['methodologicalRigor', 'theoreticalDepth', 'structuralClarity', 'literatureSynthesis']
            },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedRevisions: { type: Type.ARRAY, items: { type: Type.STRING } },
            ethicalConsiderations: { type: Type.STRING },
            concludingRemarks: { type: Type.STRING }
          },
          required: [
            'recommendation',
            'overallScore',
            'criteriaScores',
            'keyStrengths',
            'suggestedRevisions',
            'ethicalConsiderations',
            'concludingRemarks'
          ]
        }
      }
    });
    return response.text;
  }, 'Stage5-PeerReview');

  const data = extractJson<PeerReviewResult>(responseText);
  const summary = `Peer Review complete: ${data.recommendation} (Score: ${data.overallScore}/10). Identified ${data.keyStrengths.length} core strengths and ${data.suggestedRevisions.length} revision priorities. [via ${modelUsed}]`;
  return { data, summary };
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Health check with active model and API key verification
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    primaryModel: PRIMARY_MODEL,
    fallbackModels: FALLBACK_MODELS,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Diagnostic minimal test endpoint
app.post('/api/pipeline/diagnostic-test', async (req: Request, res: Response) => {
  try {
    const ai = getGenAI();
    const result = await runDiagnosticTest(ai);
    res.json(result);
  } catch (error: any) {
    console.error('Diagnostic test failed:', error);
    res.status(500).json({
      success: false,
      error: formatErrorMessage(error)
    });
  }
});

// Prompt Configuration endpoint (for downloading JSON and UI inspectability)
app.get('/api/pipeline/prompt-config', (req: Request, res: Response) => {
  res.json({
    primaryModel: PRIMARY_MODEL,
    fallbackModels: FALLBACK_MODELS,
    retryPolicy: {
      maxRetries: 3,
      backoff: 'Exponential with jitter (1s, 2s, 4s)',
      retryableStatusCodes: [503, 429]
    },
    stages: [
      { id: 'classification', name: 'Classification & Scope', description: 'Taxonomic categorization, sub-discipline profiling, and methodological paradigm mapping.' },
      { id: 'research_questions', name: 'Research Questions & Hypotheses', description: 'Formulation of primary RQ, secondary RQs, testable hypotheses (H1, H2), and variable operationalization.' },
      { id: 'outline', name: 'Structural Outline', description: 'Section-by-section academic roadmap with analytical key points and methodological trajectory.' },
      { id: 'draft', name: 'Few-Shot Paper Drafting', description: 'Full academic drafting across all 10 standard sections conditioned on peer-reviewed few-shot exemplars.' },
      { id: 'peer_review', name: 'Peer Review & Rigor Evaluation', description: 'Standardized double-blind peer review rubric evaluating rigor, literature depth, and limitations.' }
    ],
    fewShotExamples: FEW_SHOT_EXAMPLES,
    systemPrompt: `You are ScholarForge AI, an elite academic research agent. You generate publication-grade research papers following IMRaD (Introduction, Methods, Results, and Discussion) standards and peer-reviewed rigor. You employ few-shot prompting demonstrations to enforce academic register, structured sections, and rigorous scholarly synthesis.`
  });
});

// Execute an individual stage
app.post('/api/pipeline/run-stage', async (req: Request, res: Response) => {
  try {
    const ai = getGenAI();
    const { stageId, request, classification, researchQuestions, outline, draft } = req.body as {
      stageId: StageId;
      request: PaperRequest;
      classification?: ClassificationResult;
      researchQuestions?: ResearchQuestionsResult;
      outline?: OutlineResult;
      draft?: StructuredPaperDraft;
    };

    if (!stageId || !request?.topic) {
      return res.status(400).json({ error: 'Missing required stageId or topic in request.' });
    }

    switch (stageId) {
      case 'classification': {
        const result = await runClassificationStage(ai, request);
        return res.json({ stageId, result: result.data, summary: result.summary });
      }
      case 'research_questions': {
        if (!classification) {
          return res.status(400).json({ error: 'Classification data is required to run Research Questions stage.' });
        }
        const result = await runResearchQuestionsStage(ai, request, classification);
        return res.json({ stageId, result: result.data, summary: result.summary });
      }
      case 'outline': {
        if (!classification || !researchQuestions) {
          return res.status(400).json({ error: 'Classification and Research Questions are required to run Outline stage.' });
        }
        const result = await runOutlineStage(ai, request, classification, researchQuestions);
        return res.json({ stageId, result: result.data, summary: result.summary });
      }
      case 'draft': {
        if (!classification || !researchQuestions || !outline) {
          return res.status(400).json({ error: 'Classification, Research Questions, and Outline are required to draft the paper.' });
        }
        const result = await runDraftStage(ai, request, classification, researchQuestions, outline);
        return res.json({ stageId, result: result.data, summary: result.summary });
      }
      case 'peer_review': {
        if (!draft || !classification) {
          return res.status(400).json({ error: 'Draft and Classification are required to run Peer Review.' });
        }
        const result = await runPeerReviewStage(ai, request, draft, classification);
        return res.json({ stageId, result: result.data, summary: result.summary });
      }
      default:
        return res.status(400).json({ error: `Unknown stageId: ${stageId}` });
    }
  } catch (error: any) {
    console.error(`Error running stage:`, error);
    res.status(500).json({
      error: formatErrorMessage(error)
    });
  }
});

// Execute the entire 5-stage pipeline
app.post('/api/pipeline/generate-all', async (req: Request, res: Response) => {
  try {
    const ai = getGenAI();
    const { request } = req.body as { request: PaperRequest };

    if (!request || !request.topic) {
      return res.status(400).json({ error: 'A research topic is required.' });
    }

    // 1. Classification
    const classRes = await runClassificationStage(ai, request);

    // 2. Research Questions
    const rqRes = await runResearchQuestionsStage(ai, request, classRes.data);

    // 3. Outline
    const outlineRes = await runOutlineStage(ai, request, classRes.data, rqRes.data);

    // 4. Draft
    const draftRes = await runDraftStage(ai, request, classRes.data, rqRes.data, outlineRes.data);

    // 5. Peer Review
    const reviewRes = await runPeerReviewStage(ai, request, draftRes.data, classRes.data);

    res.json({
      success: true,
      data: {
        classification: classRes.data,
        researchQuestions: rqRes.data,
        outline: outlineRes.data,
        draft: draftRes.data,
        peerReview: reviewRes.data,
        summaries: {
          classification: classRes.summary,
          research_questions: rqRes.summary,
          outline: outlineRes.summary,
          draft: draftRes.summary,
          peer_review: reviewRes.summary
        }
      }
    });
  } catch (error: any) {
    console.error('Error generating complete paper:', error);
    res.status(500).json({
      error: formatErrorMessage(error)
    });
  }
});

// Follow-up chat interface endpoint with retry and fallback
app.post('/api/pipeline/chat', async (req: Request, res: Response) => {
  try {
    const ai = getGenAI();
    const { message, draft, history, classification } = req.body as {
      message: string;
      draft?: StructuredPaperDraft;
      history?: { role: 'user' | 'assistant'; content: string }[];
      classification?: ClassificationResult;
    };

    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const paperContext = draft
      ? `CURRENT PAPER CONTEXT:
Title: ${draft.title}
Abstract: ${draft.abstract}
Introduction excerpt: ${draft.introduction?.slice(0, 500)}...
Methodology excerpt: ${draft.methodology?.slice(0, 700)}...
Findings excerpt: ${draft.findings?.slice(0, 700)}...
Conclusion excerpt: ${draft.conclusion?.slice(0, 500)}...
References: ${draft.references?.slice(0, 5).join('; ')}`
      : 'No paper draft currently generated yet.';

    const systemInstruction = `You are a Senior Academic Research Advisor and co-author.
You assist the user in discussing, refining, critiquing, or extending the research paper.
Provide nuanced, scholarly, yet accessible explanations.
When asked to revise a section, explain a methodology, suggest experimental controls, or compare with literature, adhere strictly to academic rigor.
Do not invent fictitious citations; cite well-established empirical principles or foundational authors.`;

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    if (history && history.length > 0) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [
        {
          text: `${paperContext}\n\nUSER QUESTION/REQUEST: ${message}`
        }
      ]
    });

    const { result: replyText } = await executeWithRetryAndFallback(async (model) => {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction
        }
      });
      return response.text || 'No response generated.';
    }, 'ChatAdvisor');

    res.json({
      reply: replyText
    });
  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      error: formatErrorMessage(error)
    });
  }
});

// Serve frontend in dev (via Vite middlewares) or in production (via static dist)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarForge Academic Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
