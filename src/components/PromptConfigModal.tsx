import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Sparkles,
  BookOpen,
  Layers,
  Code
} from 'lucide-react';
import { FEW_SHOT_EXAMPLES } from '../data/fewShotExamples';
import { downloadFile } from '../utils/exportUtils';

interface PromptConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptConfigModal: React.FC<PromptConfigModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fewshot1' | 'fewshot2' | 'rawjson'>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const configJson = {
    primaryModel: 'gemini-3.1-flash-lite',
    fallbackModels: ['gemini-flash-latest', 'gemini-3.8-flash'],
    retryPolicy: {
      maxRetries: 3,
      backoff: 'Exponential with random jitter (1000ms, 2000ms, 4000ms)',
      retryableStatusCodes: [503, 429],
      handling: 'Automatic retry on high demand or rate limits with graceful model fallback'
    },
    pipelineStages: [
      { id: 'classification', name: 'Topic Classification & Scope Feasibility' },
      { id: 'research_questions', name: 'Research Questions & Working Hypotheses' },
      { id: 'outline', name: 'Structural Academic Outline Roadmap' },
      { id: 'draft', name: 'Few-Shot Conditioned Paper Drafting' },
      { id: 'peer_review', name: 'Double-Blind Peer Review Rigor Evaluation' }
    ],
    fewShotPromptingMethodology: {
      description: 'The model is provided with two complete peer-reviewed paper exemplars to enforce academic register, IMRaD structure, grounded variable operationalization, and authentic reference citations.',
      examplesCount: FEW_SHOT_EXAMPLES.length,
      examples: FEW_SHOT_EXAMPLES
    },
    systemInstruction: 'You are ScholarForge AI, an elite academic research agent. You generate publication-grade research papers following IMRaD standards and peer-reviewed rigor. You employ few-shot prompting demonstrations to enforce academic register, structured sections, and rigorous scholarly synthesis.'
  };

  const jsonString = JSON.stringify(configJson, null, 2);

  const handleDownloadJson = () => {
    downloadFile(jsonString, 'scholarforge_prompt_configuration.json', 'application/json');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Prompt Configuration &amp; Few-Shot Demonstrations
              </h3>
              <p className="text-xs text-slate-400">
                Multi-stage orchestration architecture with 2 verified academic few-shot examples
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            System Instruction &amp; Stages
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fewshot1')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'fewshot1'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Few-Shot Ex 1: AI Fairness
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fewshot2')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'fewshot2'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Few-Shot Ex 2: Marine Microplastics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rawjson')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'rawjson'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Full Config JSON
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-5 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 block mb-1">
                  Master System Instruction
                </span>
                <p className="text-slate-800 font-mono text-[11px] leading-relaxed">
                  {configJson.systemInstruction}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  5-Stage Autonomous Execution Chain
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {configJson.pipelineStages.map((s, idx) => (
                    <div key={s.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800">{s.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono ml-7 block mt-0.5">
                        ID: {s.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block mb-1">
                  Few-Shot Prompt Conditioning Role:
                </span>
                <p className="leading-relaxed text-slate-600">
                  Instead of generating generic conversational prose, the drafting prompt dynamically injects complete structured specimens from distinct scientific disciplines (Computer Science and Environmental Ecotoxicology). This conditions the model on dense academic diction, precise quantitative metrics, IMRaD section transitions, and recognized seminal academic citations.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'fewshot1' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 block">
                  Example 1: Computer Science &amp; Artificial Intelligence
                </span>
                <h4 className="font-bold text-sm text-indigo-950 mt-1">
                  {FEW_SHOT_EXAMPLES[0].topic}
                </h4>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Demonstrated RQ1:</span>
                  <p className="italic text-slate-700">
                    &ldquo;{FEW_SHOT_EXAMPLES[0].researchQuestions.primaryQuestion}&rdquo;
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Demonstrated Abstract Specimen:</span>
                  <p className="text-slate-700 leading-relaxed font-serif-paper text-[13px]">
                    {FEW_SHOT_EXAMPLES[0].draft.abstract}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Authentic Seminal Citations Provided:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    {FEW_SHOT_EXAMPLES[0].draft.references.slice(0, 5).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fewshot2' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                  Example 2: Environmental Science &amp; Marine Biology
                </span>
                <h4 className="font-bold text-sm text-emerald-950 mt-1">
                  {FEW_SHOT_EXAMPLES[1].topic}
                </h4>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Demonstrated RQ1:</span>
                  <p className="italic text-slate-700">
                    &ldquo;{FEW_SHOT_EXAMPLES[1].researchQuestions.primaryQuestion}&rdquo;
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Demonstrated Abstract Specimen:</span>
                  <p className="text-slate-700 leading-relaxed font-serif-paper text-[13px]">
                    {FEW_SHOT_EXAMPLES[1].draft.abstract}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Authentic Seminal Citations Provided:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    {FEW_SHOT_EXAMPLES[1].draft.references.slice(0, 5).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rawjson' && (
            <div className="relative">
              <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[450px]">
                {jsonString}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Powered by Gemini API (<span className="font-mono text-indigo-600">gemini-3.1-flash-lite</span> with automatic retry &amp; fallback)
          </span>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Configuration as JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
