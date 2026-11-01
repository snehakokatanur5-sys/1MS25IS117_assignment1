import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ResearchForm } from './components/ResearchForm';
import { WorkflowStepper } from './components/WorkflowStepper';
import { StageInspector } from './components/StageInspector';
import { PaperViewer } from './components/PaperViewer';
import { FollowUpChat } from './components/FollowUpChat';
import { PromptConfigModal } from './components/PromptConfigModal';
import {
  PaperRequest,
  StageId,
  StageStatus,
  ClassificationResult,
  ResearchQuestionsResult,
  OutlineResult,
  StructuredPaperDraft,
  PeerReviewResult
} from './types/research';
import { SAMPLE_TOPIC_PRESETS, SampleTopicPreset } from './data/samplePrompts';
import { FEW_SHOT_EXAMPLES } from './data/fewShotExamples';
import {
  AlertCircle,
  Sparkles,
  BookOpen,
  FileText,
  MessageSquare,
  Award,
  Layers,
  CheckCircle2,
  X,
  RotateCcw,
  Zap
} from 'lucide-react';

export default function App() {
  // Main paper parameters state
  const [request, setRequest] = useState<PaperRequest>({
    topic: 'Side-Channel Resistance and Hardware Complexity of Module-LWE Post-Quantum Key Encapsulation Mechanisms in Embedded IoT Processors',
    field: 'Computer Science & AI',
    length: 'standard',
    methodologyPreference: 'computational_simulation',
    customNotes: 'Focus on NIST PQC standards (ML-KEM / Kyber), power analysis vulnerabilities, and silicon area trade-offs.'
  });

  const [activePresetTitle, setActivePresetTitle] = useState<string>('Post-Quantum Lattice Cryptography');

  // Multi-stage pipeline states
  const [currentStage, setCurrentStage] = useState<StageId | 'idle' | 'complete' | 'error'>('idle');
  const [selectedStageToView, setSelectedStageToView] = useState<StageId | 'paper'>('classification');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Diagnostic minimal test state
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    latencyMs?: number;
    model?: string;
    success?: boolean;
    message?: string;
  } | null>(null);

  // Stage outputs
  const [classification, setClassification] = useState<ClassificationResult | undefined>();
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestionsResult | undefined>();
  const [outline, setOutline] = useState<OutlineResult | undefined>();
  const [draft, setDraft] = useState<StructuredPaperDraft | undefined>();
  const [peerReview, setPeerReview] = useState<PeerReviewResult | undefined>();

  // Stage statuses
  const [stageStatuses, setStageStatuses] = useState<Record<StageId, StageStatus>>({
    classification: { status: 'pending' },
    research_questions: { status: 'pending' },
    outline: { status: 'pending' },
    draft: { status: 'pending' },
    peer_review: { status: 'pending' }
  });

  // UI Modals
  const [isPromptConfigOpen, setIsPromptConfigOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  // Health check on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setApiHealthy(Boolean(data.hasApiKey));
      })
      .catch(() => {
        setApiHealthy(false);
      });
  }, []);

  // Run minimal diagnostic test
  const handleRunDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    setErrorBanner(null);
    try {
      const response = await fetch('/api/pipeline/diagnostic-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Diagnostic test failed.');
      }
      setDiagnosticResult({
        latencyMs: data.latencyMs,
        model: data.model,
        success: true,
        message: data.message
      });
      setApiHealthy(true);
    } catch (err: any) {
      console.error('Diagnostic error:', err);
      setDiagnosticResult({ success: false });
      setErrorBanner(err.message || 'Diagnostic connection test failed.');
    } finally {
      setIsDiagnosticRunning(false);
    }
  };

  // Update request
  const handleRequestChange = (updated: Partial<PaperRequest>) => {
    setRequest((prev) => ({ ...prev, ...updated }));
  };

  // Load a preset topic
  const handleSelectPreset = (preset: SampleTopicPreset) => {
    setRequest(preset.request);
    setActivePresetTitle(preset.title);
    setErrorBanner(null);
  };

  // Run the full 5-stage automated pipeline
  const handleGenerateAll = async () => {
    if (!request.topic.trim()) {
      setErrorBanner('Please enter a valid research topic before generating.');
      return;
    }

    setIsLoading(true);
    setErrorBanner(null);
    setCurrentStage('classification');

    // Reset statuses to running
    setStageStatuses({
      classification: { status: 'running' },
      research_questions: { status: 'pending' },
      outline: { status: 'pending' },
      draft: { status: 'pending' },
      peer_review: { status: 'pending' }
    });

    try {
      const response = await fetch('/api/pipeline/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned error status ${response.status}`);
      }

      const resData = await response.json();
      const payload = resData.data;

      setClassification(payload.classification);
      setResearchQuestions(payload.researchQuestions);
      setOutline(payload.outline);
      setDraft(payload.draft);
      setPeerReview(payload.peerReview);

      setStageStatuses({
        classification: {
          status: 'completed',
          summary: payload.summaries?.classification || 'Taxonomy and scope established.'
        },
        research_questions: {
          status: 'completed',
          summary: payload.summaries?.research_questions || 'Research questions and hypotheses operationalized.'
        },
        outline: {
          status: 'completed',
          summary: payload.summaries?.outline || 'Structural academic roadmap constructed.'
        },
        draft: {
          status: 'completed',
          summary: payload.summaries?.draft || 'Full 10-section manuscript drafted with few-shot conditioning.'
        },
        peer_review: {
          status: 'completed',
          summary: payload.summaries?.peer_review || 'Double-blind peer review report completed.'
        }
      });

      setCurrentStage('complete');
      setSelectedStageToView('paper');
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setCurrentStage('error');
      setErrorBanner(
        err.message || 'An error occurred during paper generation. Please ensure your GEMINI_API_KEY is configured.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Run a single stage (Step-by-Step execution)
  const handleExecuteSingleStage = async (stageId: StageId) => {
    if (!request.topic.trim()) {
      setErrorBanner('Please enter a research topic first.');
      return;
    }

    setIsLoading(true);
    setErrorBanner(null);
    setCurrentStage(stageId);
    setSelectedStageToView(stageId);

    setStageStatuses((prev) => ({
      ...prev,
      [stageId]: { status: 'running' }
    }));

    try {
      const response = await fetch('/api/pipeline/run-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageId,
          request,
          classification,
          researchQuestions,
          outline,
          draft
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed executing stage ${stageId}`);
      }

      const data = await response.json();

      if (stageId === 'classification') {
        setClassification(data.result);
      } else if (stageId === 'research_questions') {
        setResearchQuestions(data.result);
      } else if (stageId === 'outline') {
        setOutline(data.result);
      } else if (stageId === 'draft') {
        setDraft(data.result);
      } else if (stageId === 'peer_review') {
        setPeerReview(data.result);
      }

      setStageStatuses((prev) => ({
        ...prev,
        [stageId]: {
          status: 'completed',
          summary: data.summary
        }
      }));

      // Auto advance view
      if (stageId === 'draft') {
        setSelectedStageToView('paper');
      }
    } catch (err: any) {
      console.error(`Error in stage ${stageId}:`, err);
      setErrorBanner(err.message || `Failed to run stage ${stageId}`);
      setStageStatuses((prev) => ({
        ...prev,
        [stageId]: { status: 'error', error: err.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Next stage in step-by-step
  const getNextStage = (current: StageId): StageId | null => {
    const sequence: StageId[] = ['classification', 'research_questions', 'outline', 'draft', 'peer_review'];
    const idx = sequence.indexOf(current);
    if (idx !== -1 && idx < sequence.length - 1) {
      return sequence[idx + 1];
    }
    return null;
  };

  const getNextStageLabel = (current: StageId): string => {
    switch (current) {
      case 'classification':
        return 'Research Questions (Stage 2)';
      case 'research_questions':
        return 'Outline Roadmap (Stage 3)';
      case 'outline':
        return 'Paper Drafting (Stage 4)';
      case 'draft':
        return 'Peer Review (Stage 5)';
      default:
        return 'Next Stage';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenPromptConfig={() => setIsPromptConfigOpen(true)}
        apiHealthy={apiHealthy}
        activePresetTitle={activePresetTitle}
        onRunDiagnostic={handleRunDiagnostic}
        isDiagnosticRunning={isDiagnosticRunning}
        diagnosticResult={diagnosticResult}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification Banner with Actionable Remedies */}
        {errorBanner && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Service Notice: </span>
                <span>{errorBanner}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleRunDiagnostic}
                disabled={isDiagnosticRunning}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                <span>Test Connection</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateAll}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>

              <button
                type="button"
                onClick={() => setErrorBanner(null)}
                className="text-rose-400 hover:text-rose-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Diagnostic Success Banner */}
        {diagnosticResult?.success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong className="font-bold">Gemini API Online:</strong> Minimal text generation succeeded in{' '}
                <span className="font-mono font-bold">{diagnosticResult.latencyMs}ms</span> via{' '}
                <span className="font-mono text-indigo-700">{diagnosticResult.model}</span>. (Message: &ldquo;{diagnosticResult.message}&rdquo;)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDiagnosticResult(null)}
              className="text-emerald-500 hover:text-emerald-800 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. Research Parameters Form */}
        <ResearchForm
          request={request}
          onChange={handleRequestChange}
          onGenerateAll={handleGenerateAll}
          onRunFirstStage={() => handleExecuteSingleStage('classification')}
          isLoading={isLoading}
          onSelectPreset={handleSelectPreset}
        />

        {/* 2. Visual Workflow Stepper */}
        <WorkflowStepper
          currentStage={currentStage}
          stageStatuses={stageStatuses}
          selectedStageToView={selectedStageToView}
          onSelectStageToView={(stage) => setSelectedStageToView(stage)}
          isLoading={isLoading}
          onExecuteSingleStage={handleExecuteSingleStage}
        />

        {/* 3. Dynamic Viewer Canvas (Paper Reader OR Stage Inspector) */}
        {selectedStageToView === 'paper' && draft ? (
          <PaperViewer
            draft={draft}
            peerReview={peerReview}
            request={request}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenPromptConfig={() => setIsPromptConfigOpen(true)}
          />
        ) : (
          <StageInspector
            selectedStage={selectedStageToView === 'paper' ? 'classification' : selectedStageToView}
            classification={classification}
            researchQuestions={researchQuestions}
            outline={outline}
            draft={draft}
            peerReview={peerReview}
            isLoading={isLoading}
            nextStageName={
              selectedStageToView !== 'paper' ? getNextStageLabel(selectedStageToView) : undefined
            }
            onProceedNext={
              selectedStageToView !== 'paper' && getNextStage(selectedStageToView)
                ? () => handleExecuteSingleStage(getNextStage(selectedStageToView)!)
                : undefined
            }
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ScholarForge AI</span>
            <span>•</span>
            <span>Academic Research Paper Agent with Few-Shot Prompting</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button
              type="button"
              onClick={handleRunDiagnostic}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Test API Connection
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsPromptConfigOpen(true)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Prompt Configuration
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Follow-Up Chat
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Follow-Up Chat Button */}
      {draft && !isChatOpen && (
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 text-white hover:bg-indigo-700 shadow-xl border border-slate-700 transition-all cursor-pointer font-bold text-xs"
        >
          <MessageSquare className="w-4 h-4 text-indigo-300" />
          <span>Scholarly Follow-Up Q&amp;A</span>
        </button>
      )}

      {/* Chat Drawer */}
      <FollowUpChat
        draft={draft}
        classification={classification}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Prompt Config Modal */}
      <PromptConfigModal
        isOpen={isPromptConfigOpen}
        onClose={() => setIsPromptConfigOpen(false)}
      />
    </div>
  );
}
