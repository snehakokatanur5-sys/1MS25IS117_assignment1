# ScholarForge AI - Research Paper Agent

ScholarForge AI is a full-stack, AI-powered academic research paper generation and peer-review platform built with React, Node.js (Express), and Google Gemini (`@google/genai`).

It empowers researchers, students, and academics to transform a research inquiry into a publication-grade, structured scholarly paper through a five-stage academic pipeline with few-shot prompting, automated double-blind peer review, and interactive scholarly chat.

---

## Key Features

1. **Academic Configuration**:
   - Custom research topic input, target academic field (Computer Science, Biomedicine, Environmental Science, Economics, etc.), and desired paper length (Brief ~1,500w, Standard ~3,000w, Comprehensive ~5,000w).
   - Optional methodological paradigm selection (Empirical Quantitative, Qualitative Exploratory, Mixed Methods, Theoretical / Systematic Review, Computational Simulation).

2. **Full Structured Paper Generation (10 Academic Sections)**:
   - Title
   - Structured Abstract (Background, Objective, Methodology, Results, Significance)
   - Keywords (MeSH / ACM standard terminology)
   - Introduction (Context, problem definition, theoretical tensions, research statement)
   - Research Objectives & Hypotheses (RQ1, secondary questions, formal hypotheses, variable mapping)
   - Literature Review (Thematic synthesis with foundational authors)
   - Methodology (Detailed protocol, dataset/samples, instruments, controls, statistical tests)
   - Findings & Empirical Discussion (Quantitative metrics, comparative analysis, interpretations)
   - Conclusion & Future Work (Key takeaways, limitations, policy/practical implications)
   - Authentic References (APA/IEEE standard format grounded in foundational scholarly literature)

3. **Few-Shot Prompting Architecture**:
   - Conditioned on two domain-specific few-shot examples:
     - **Example 1 (Computer Science & AI)**: Algorithmic bias mitigation in automated resume screening (Adversarial Debiasing vs. Counterfactual Augmentation).
     - **Example 2 (Environmental & Earth Sciences)**: Microplastic biomagnification vs. trophic dilution in estuarine benthic food webs.
   - Users can inspect and download the complete prompt engineering configuration as JSON at any time.

4. **Multi-Stage Academic Pipeline**:
   - **Stage 1: Topic Classification & Scope Feasibility**: Disciplinary taxonomy, target audience, paradigm, and theoretical frameworks.
   - **Stage 2: Research Questions & Working Hypotheses**: Primary RQ, secondary questions, formal testable hypotheses, and operationalized variables.
   - **Stage 3: Structural Outline Roadmap**: Comprehensive section-by-section outline with analytical key points and methodological trajectory.
   - **Stage 4: Few-Shot Paper Drafting**: Full academic writing following the few-shot patterns and rigorous scholarly tone.
   - **Stage 5: Independent Peer Review**: Automated referee report assessing methodological rigor, theoretical depth, clarity, strengths, revisions, and ethical considerations (1-10 scoring rubric).

5. **Follow-Up Scholarly Chat**:
   - Interactive conversational assistant with full paper context to answer follow-up questions, explain statistical methodology, draft conference slides, or prepare rebuttals.

6. **Exports & Downloads**:
   - **Download as TXT**: Clean, formatted academic manuscript ready for submission or offline review.
   - **Download Prompt Configuration (JSON)**: Full system prompt, few-shot demonstrations, and pipeline parameters.
   - **Export BibTeX**: Standardized citations for reference managers (Zotero, Mendeley, Overleaf/LaTeX).

7. **Security & Server-Side Execution**:
   - Gemini API calls are strictly handled server-side (`server.ts`) via the `@google/genai` SDK using `process.env.GEMINI_API_KEY`.
   - API keys are never exposed to browser bundles or client requests.

8. **High Availability, Exponential Backoff & Diagnostic Verification**:
   - **Primary Model**: `gemini-3.1-flash-lite` for high responsiveness and immunity to temporary 503 high-demand spikes.
   - **Model Fallback Chain**: Automatically cascades to `gemini-flash-latest` and `gemini-3.8-flash`.
   - **Exponential Backoff**: Up to 3 retries with random jitter (1,000ms, 2,000ms, 4,000ms) for transient 503 and 429 status codes.
   - **Diagnostic Endpoint**: Dedicated `/api/pipeline/diagnostic-test` endpoint and UI button to verify basic text generation in <1 second before full paper execution.

---

## Multi-Stage Workflow Overview

```
[User Input: Topic, Field, Length, Notes]
                       │
                       ▼
       ┌───────────────────────────────┐
       │ STAGE 1: Topic Classification │  (Subfield, Paradigm, Frameworks)
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │ STAGE 2: Research Questions   │  (RQ1, Sub-RQs, H1/H2, Variables)
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │ STAGE 3: Structural Outline   │  (Section Breakdown, Key Arguments)
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │ STAGE 4: Few-Shot Drafting    │  (10 Sections, Scholarly Prose)
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │ STAGE 5: Peer Review Rubric   │  (Score 1-10, Strengths, Caveats)
       └───────────────┬───────────────┘
                       │
                       ▼
    [Complete Paper Viewer + Exports + Interactive Chat]
```

---

## File Structure

```
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore configuration
├── index.html                # Entry HTML with academic Google Fonts
├── metadata.json             # Applet capabilities & metadata
├── package.json              # Dependencies and run scripts
├── README.md                 # Project documentation
├── sample_prompt.json        # Sample prompt configuration export
├── sample_output.txt         # Complete sample generated research paper
├── server.ts                 # Full-stack Node.js Express server + Gemini SDK
├── src/
│   ├── App.tsx               # Main application container & state management
│   ├── main.tsx              # React DOM mounting
│   ├── index.css             # Tailwind CSS & academic typography styles
│   ├── types/
│   │   └── research.ts       # TypeScript interfaces for stages, paper, review, chat
│   ├── data/
│   │   ├── fewShotExamples.ts# 2 complete peer-reviewed few-shot examples
│   │   └── samplePrompts.ts  # Preset sample research topics for 1-click testing
│   ├── utils/
│   │   └── exportUtils.ts    # TXT, BibTeX, and JSON download utilities
│   └── components/
│       ├── Header.tsx        # Top navigation, status indicator & actions
│       ├── ResearchForm.tsx  # Topic input, discipline selection & length options
│       ├── WorkflowStepper.tsx# Visual stage progress stepper with summaries
│       ├── StageInspector.tsx# Collapsible inspector tabs for intermediate stages
│       ├── PaperViewer.tsx   # Dual-mode academic paper reader & section navigator
│       ├── FollowUpChat.tsx  # Interactive academic advisor chat
│       └── PromptConfigModal.tsx # Full prompt config & few-shot inspector modal
├── tsconfig.json
└── vite.config.ts
```

---

## Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Key**:
   Set `GEMINI_API_KEY` in your environment or `.env` file:
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```
