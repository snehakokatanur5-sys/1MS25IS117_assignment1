import React from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Compass,
  HelpCircle,
  ListTree,
  FileEdit,
  Award
} from 'lucide-react';
import { StageId, StageStatus } from '../types/research';

interface WorkflowStepperProps {
  currentStage: StageId | 'idle' | 'complete' | 'error';
  stageStatuses: Record<StageId, StageStatus>;
  selectedStageToView: StageId | 'paper';
  onSelectStageToView: (stage: StageId | 'paper') => void;
  isLoading: boolean;
  onExecuteSingleStage?: (stageId: StageId) => void;
}

interface StageMeta {
  id: StageId;
  number: number;
  name: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageMeta[] = [
  {
    id: 'classification',
    number: 1,
    name: 'Classification & Scope',
    shortDesc: 'Taxonomy, paradigm & theoretical frameworks',
    icon: Compass
  },
  {
    id: 'research_questions',
    number: 2,
    name: 'Questions & Hypotheses',
    shortDesc: 'RQ1, secondary questions, H1/H2 & variables',
    icon: HelpCircle
  },
  {
    id: 'outline',
    number: 3,
    name: 'Structural Outline',
    shortDesc: 'Hierarchical IMRaD section roadmap',
    icon: ListTree
  },
  {
    id: 'draft',
    number: 4,
    name: 'Few-Shot Drafting',
    shortDesc: 'Full 10-part paper with literature & findings',
    icon: FileEdit
  },
  {
    id: 'peer_review',
    number: 5,
    name: 'Independent Peer Review',
    shortDesc: 'Referee scores, criteria rigor & revisions',
    icon: Award
  }
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStage,
  stageStatuses,
  selectedStageToView,
  onSelectStageToView,
  isLoading,
  onExecuteSingleStage
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">2</span>
            Autonomous Scholarly Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Five sequential academic stages with transparent summaries and inspectable artifacts.
          </p>
        </div>

        {stageStatuses.draft.status === 'completed' && (
          <button
            type="button"
            onClick={() => onSelectStageToView('paper')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedStageToView === 'paper'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
            }`}
          >
            Read Full Paper Draft
          </button>
        )}
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {STAGES.map((s, idx) => {
          const status = stageStatuses[s.id]?.status || 'pending';
          const summary = stageStatuses[s.id]?.summary;
          const isSelected = selectedStageToView === s.id;
          const isCurrentlyRunning = currentStage === s.id && isLoading;
          const Icon = s.icon;

          return (
            <div
              key={s.id}
              onClick={() => onSelectStageToView(s.id)}
              className={`relative rounded-xl border p-3.5 transition-all cursor-pointer text-left flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40'
                  : status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                  : isCurrentlyRunning
                  ? 'border-indigo-400 bg-indigo-50/30'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <div>
                {/* Header row: Step # + Status Icon */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCurrentlyRunning
                        ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    Stage {s.number}
                  </span>

                  <div>
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrentlyRunning ? (
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                </div>

                {/* Stage Title */}
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      status === 'completed'
                        ? 'text-emerald-700'
                        : isCurrentlyRunning
                        ? 'text-indigo-600'
                        : 'text-slate-500'
                    }`}
                  />
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {s.name}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {s.shortDesc}
                </p>
              </div>

              {/* Concise Workflow Summary */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                {summary ? (
                  <p className="text-[11px] font-medium text-slate-700 leading-snug line-clamp-2" title={summary}>
                    <span className="text-emerald-600 font-bold mr-1">Done:</span>
                    {summary}
                  </p>
                ) : isCurrentlyRunning ? (
                  <p className="text-[11px] font-medium text-indigo-600 italic">
                    Synthesizing with Gemini...
                  </p>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Awaiting execution</span>
                    {onExecuteSingleStage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExecuteSingleStage(s.id);
                        }}
                        disabled={isLoading}
                        className="text-[10px] text-indigo-600 font-semibold hover:underline"
                      >
                        Run
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
