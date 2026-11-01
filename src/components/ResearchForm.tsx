import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Play
} from 'lucide-react';
import { PaperRequest, AcademicField, PaperLengthOption, MethodologyType } from '../types/research';
import { SAMPLE_TOPIC_PRESETS, SampleTopicPreset } from '../data/samplePrompts';

interface ResearchFormProps {
  request: PaperRequest;
  onChange: (updated: Partial<PaperRequest>) => void;
  onGenerateAll: () => void;
  onRunFirstStage: () => void;
  isLoading: boolean;
  onSelectPreset: (preset: SampleTopicPreset) => void;
}

const ACADEMIC_FIELDS: AcademicField[] = [
  'Computer Science & AI',
  'Medicine & Biomedical Sciences',
  'Environmental & Earth Sciences',
  'Economics & Business Administration',
  'Psychology & Behavioral Neuroscience',
  'Physics & Quantum Engineering',
  'Sociology & Public Policy',
  'Molecular Biology & Genetics',
  'Philosophy & Bioethics',
  'Electrical & Systems Engineering'
];

export const ResearchForm: React.FC<ResearchFormProps> = ({
  request,
  onChange,
  onGenerateAll,
  onRunFirstStage,
  isLoading,
  onSelectPreset
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const lengthDescriptions: Record<PaperLengthOption, { label: string; desc: string; badge: string }> = {
    brief: {
      label: 'Brief / Short Communication',
      desc: '~1,500 words. Focused research note or rapid communication.',
      badge: '~1,500w'
    },
    standard: {
      label: 'Standard Conference / Journal',
      desc: '~3,000 words. Full balanced scholarly paper with complete sections.',
      badge: '~3,000w'
    },
    comprehensive: {
      label: 'Comprehensive Journal Article',
      desc: '~5,000 words. Deep theoretical synthesis, extensive analysis & literature review.',
      badge: '~5,000w'
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-all">
      {/* Header section with preset topic chips */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">1</span>
              Research Topic & Academic Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your inquiry or choose a curated multidisciplinary preset below.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Quick Presets:
            </span>
            {SAMPLE_TOPIC_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPreset(p)}
                disabled={isLoading}
                className="px-2.5 py-1 text-xs rounded-md font-medium bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 transition-all cursor-pointer disabled:opacity-50"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Research Topic or Working Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <textarea
              value={request.topic}
              onChange={(e) => onChange({ topic: e.target.value })}
              disabled={isLoading}
              rows={3}
              placeholder="e.g., Mitigating Demographic Bias in Automated Candidate Screening: A Comparative Study of Counterfactual Data Augmentation and Adversarial Debiasing"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-inner disabled:bg-slate-50 disabled:text-slate-500 font-sans"
            />
            <div className="absolute right-2.5 bottom-2 text-[11px] text-slate-400">
              {request.topic.length} chars
            </div>
          </div>
        </div>
      </div>

      {/* Field & Length row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Academic Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Academic Discipline & Field <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={request.field}
              onChange={(e) => onChange({ field: e.target.value })}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-2xs appearance-none cursor-pointer disabled:bg-slate-50"
            >
              {ACADEMIC_FIELDS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Length selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Target Paper Length & Depth <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['brief', 'standard', 'comprehensive'] as PaperLengthOption[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ length: opt })}
                disabled={isLoading}
                className={`py-2 px-2.5 rounded-xl text-center border transition-all cursor-pointer disabled:opacity-50 ${
                  request.length === opt
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold capitalize">{opt}</div>
                <div
                  className={`text-[10px] mt-0.5 font-medium ${
                    request.length === opt ? 'text-indigo-100' : 'text-slate-500'
                  }`}
                >
                  {lengthDescriptions[opt].badge}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Options Accordion */}
      <div className="border-t border-slate-100 pt-3 mb-5">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            Methodological Approach & Custom Directives (Optional)
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100/80">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Methodology Paradigm Preference
              </label>
              <select
                value={request.methodologyPreference || 'empirical_quantitative'}
                onChange={(e) =>
                  onChange({
                    methodologyPreference: e.target.value as MethodologyType
                  })
                }
                disabled={isLoading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
              >
                <option value="empirical_quantitative">Empirical / Quantitative Experiment</option>
                <option value="qualitative_exploratory">Qualitative / Case Study / Exploratory</option>
                <option value="mixed_methods">Mixed-Methods Convergent Design</option>
                <option value="theoretical_systematic_review">Theoretical Synthesis & Systematic Review</option>
                <option value="computational_simulation">Computational Simulation & Mathematical Modeling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Author Notes, Datasets or Hypothesis Constraints
              </label>
              <input
                type="text"
                value={request.customNotes || ''}
                onChange={(e) => onChange({ customNotes: e.target.value })}
                disabled={isLoading}
                placeholder="e.g., Emphasize power analysis and NIST standards"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          <span>Output includes all 10 academic sections + peer review score</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onRunFirstStage}
            disabled={isLoading || !request.topic.trim()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-slate-600" />
            <span>Step-by-Step Mode</span>
          </button>

          <button
            type="button"
            onClick={onGenerateAll}
            disabled={isLoading || !request.topic.trim()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Generating Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Generate Full Research Paper</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
