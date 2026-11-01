export type AcademicField =
  | 'Computer Science & AI'
  | 'Medicine & Biomedical Sciences'
  | 'Environmental & Earth Sciences'
  | 'Economics & Business Administration'
  | 'Psychology & Behavioral Neuroscience'
  | 'Physics & Quantum Engineering'
  | 'Sociology & Public Policy'
  | 'Molecular Biology & Genetics'
  | 'Philosophy & Bioethics'
  | 'Electrical & Systems Engineering';

export type PaperLengthOption =
  | 'brief'       // ~1,500 words (Research Note / Short Communication)
  | 'standard'    // ~3,000 words (Conference Proceeding / Standard Article)
  | 'comprehensive'; // ~5,000 words (Comprehensive Journal Article / Survey)

export type MethodologyType =
  | 'empirical_quantitative'
  | 'qualitative_exploratory'
  | 'mixed_methods'
  | 'theoretical_systematic_review'
  | 'computational_simulation';

export interface PaperRequest {
  topic: string;
  field: AcademicField | string;
  length: PaperLengthOption;
  methodologyPreference?: MethodologyType;
  customNotes?: string;
}

export interface ClassificationResult {
  discipline: string;
  subfield: string;
  methodologicalParadigm: string;
  targetAudience: string;
  theoreticalFrameworks: string[];
  keyTerms: string[];
  feasibilityAssessment: string;
}

export interface ResearchQuestionsResult {
  primaryQuestion: string;
  secondaryQuestions: string[];
  hypotheses: {
    hypothesisCode: string;
    statement: string;
    rationale: string;
  }[];
  variables: {
    independent: string[];
    dependent: string[];
    controlledOrIntervening: string[];
  };
}

export interface OutlineSection {
  number: string;
  title: string;
  focus: string;
  subsections: string[];
  keyPoints: string[];
}

export interface OutlineResult {
  executiveSummary: string;
  sections: OutlineSection[];
  methodologicalRoadmap: string;
}

export interface StructuredPaperDraft {
  title: string;
  abstract: string;
  keywords: string[];
  introduction: string;
  researchObjectives: string;
  literatureReview: string;
  methodology: string;
  findings: string;
  conclusion: string;
  references: string[];
  wordCount?: number;
}

export interface PeerReviewResult {
  recommendation: 'Accept' | 'Accept with Minor Revisions' | 'Revise and Resubmit' | 'Reject';
  overallScore: number; // 1-10
  criteriaScores: {
    methodologicalRigor: number; // 1-10
    theoreticalDepth: number; // 1-10
    structuralClarity: number; // 1-10
    literatureSynthesis: number; // 1-10
  };
  keyStrengths: string[];
  suggestedRevisions: string[];
  ethicalConsiderations: string;
  concludingRemarks: string;
}

export type StageId =
  | 'classification'
  | 'research_questions'
  | 'outline'
  | 'draft'
  | 'peer_review';

export interface StageStatus {
  status: 'pending' | 'running' | 'completed' | 'error';
  summary?: string;
  updatedAt?: string;
  error?: string;
}

export interface ResearchPipelineData {
  request: PaperRequest;
  classification?: ClassificationResult;
  researchQuestions?: ResearchQuestionsResult;
  outline?: OutlineResult;
  draft?: StructuredPaperDraft;
  peerReview?: PeerReviewResult;
  currentStage: StageId | 'idle' | 'complete' | 'error';
  stageStatuses: Record<StageId, StageStatus>;
}

export interface FewShotExample {
  id: string;
  name: string;
  topic: string;
  field: string;
  length: PaperLengthOption;
  classification: ClassificationResult;
  researchQuestions: ResearchQuestionsResult;
  outline: OutlineResult;
  draft: StructuredPaperDraft;
  peerReview: PeerReviewResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citedSections?: string[];
}

export interface PromptConfigResponse {
  systemPrompt: string;
  fewShotExamples: FewShotExample[];
  model: string;
  temperatureNote: string;
  stages: {
    id: StageId;
    name: string;
    description: string;
  }[];
}
