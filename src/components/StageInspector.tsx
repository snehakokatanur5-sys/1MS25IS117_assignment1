import React from 'react';
import {
  Compass,
  HelpCircle,
  ListTree,
  Award,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Tag,
  ArrowRight
} from 'lucide-react';
import {
  StageId,
  ClassificationResult,
  ResearchQuestionsResult,
  OutlineResult,
  PeerReviewResult,
  StructuredPaperDraft
} from '../types/research';

interface StageInspectorProps {
  selectedStage: StageId;
  classification?: ClassificationResult;
  researchQuestions?: ResearchQuestionsResult;
  outline?: OutlineResult;
  draft?: StructuredPaperDraft;
  peerReview?: PeerReviewResult;
  onProceedNext?: () => void;
  nextStageName?: string;
  isLoading?: boolean;
}

export const StageInspector: React.FC<StageInspectorProps> = ({
  selectedStage,
  classification,
  researchQuestions,
  outline,
  draft,
  peerReview,
  onProceedNext,
  nextStageName,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-all">
      {/* ---------------- STAGE 1: CLASSIFICATION ---------------- */}
      {selectedStage === 'classification' && (
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Stage 1: Disciplinary Classification & Scope Feasibility
                </h3>
                <p className="text-xs text-slate-500">
                  Scholarly taxonomy, paradigm mapping, and theoretical grounding.
                </p>
              </div>
            </div>

            {classification && onProceedNext && (
              <button
                type="button"
                onClick={onProceedNext}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>Proceed to {nextStageName || 'Next Stage'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!classification ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              This stage has not been executed yet. Click &quot;Generate Full Research Paper&quot; or run step-by-step.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Discipline / Subfield
                  </span>
                  <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                    {classification.discipline}
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    {classification.subfield}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Methodological Paradigm
                  </span>
                  <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                    {classification.methodologicalParadigm}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Target Scholarly Audience
                  </span>
                  <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                    {classification.targetAudience}
                  </span>
                </div>
              </div>

              {/* Theoretical Frameworks */}
              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block mb-2">
                  Theoretical Frameworks & Conceptual Foundations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {classification.theoreticalFrameworks?.map((framework, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-indigo-800 text-xs font-medium shadow-2xs"
                    >
                      {framework}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key terms */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Controlled Academic Key Terms
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {classification.keyTerms?.map((term, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Feasibility */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 mr-1.5">Feasibility Assessment:</span>
                {classification.feasibilityAssessment}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- STAGE 2: RESEARCH QUESTIONS ---------------- */}
      {selectedStage === 'research_questions' && (
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Stage 2: Research Questions & Working Hypotheses
                </h3>
                <p className="text-xs text-slate-500">
                  Empirically testable inquiries, formal hypotheses, and variable operationalization.
                </p>
              </div>
            </div>

            {researchQuestions && onProceedNext && (
              <button
                type="button"
                onClick={onProceedNext}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>Proceed to {nextStageName || 'Next Stage'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!researchQuestions ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              This stage has not been executed yet. Complete Stage 1 to generate research questions.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary RQ */}
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/80">
                <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider block mb-1">
                  Primary Research Question (RQ1)
                </span>
                <p className="text-xs sm:text-sm font-bold text-indigo-950 leading-relaxed">
                  &ldquo;{researchQuestions.primaryQuestion}&rdquo;
                </p>
              </div>

              {/* Secondary RQs */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Secondary Exploratory Inquiries
                </span>
                <div className="space-y-1.5">
                  {researchQuestions.secondaryQuestions?.map((rq, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800 flex items-start gap-2"
                    >
                      <span className="font-bold text-indigo-600 min-w-[2.5rem]">
                        RQ2.{idx + 1}:
                      </span>
                      <span>{rq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hypotheses */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Testable Working Hypotheses
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {researchQuestions.hypotheses?.map((h, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 mb-1">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{h.hypothesisCode}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 mb-1.5">
                        {h.statement}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        <span className="font-semibold text-slate-700">Rationale:</span> {h.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variables matrix */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Operational Variable Matrix
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">Independent:</span>
                    <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5 text-[11px]">
                      {researchQuestions.variables?.independent?.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">Dependent:</span>
                    <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5 text-[11px]">
                      {researchQuestions.variables?.dependent?.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">Controlled:</span>
                    <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5 text-[11px]">
                      {researchQuestions.variables?.controlledOrIntervening?.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- STAGE 3: OUTLINE ---------------- */}
      {selectedStage === 'outline' && (
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <ListTree className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Stage 3: Structural Academic Outline & Narrative Roadmap
                </h3>
                <p className="text-xs text-slate-500">
                  Section-by-section breakdown following peer-reviewed IMRaD conventions.
                </p>
              </div>
            </div>

            {outline && onProceedNext && (
              <button
                type="button"
                onClick={onProceedNext}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>Proceed to {nextStageName || 'Drafting'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!outline ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Outline has not been generated yet. Complete earlier stages first.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-800 block mb-0.5">
                  Executive Structural Plan:
                </span>
                {outline.executiveSummary}
              </div>

              {/* Sections list */}
              <div className="space-y-2.5">
                {outline.sections?.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                          {sec.number}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {sec.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mb-2 italic">
                      {sec.focus}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-700 block mb-0.5">Subsections:</span>
                        <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                          {sec.subsections?.map((sub, sIdx) => (
                            <li key={sIdx}>{sub}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 block mb-0.5">Key Analytical Targets:</span>
                        <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                          {sec.keyPoints?.map((kp, kIdx) => (
                            <li key={kIdx}>{kp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Methodology roadmap */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">Methodology Roadmap Trajectory:</span>
                <p className="font-mono text-[11px] text-indigo-900 bg-white p-2 rounded border border-slate-200">
                  {outline.methodologicalRoadmap}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- STAGE 4: DRAFT SUMMARY ---------------- */}
      {selectedStage === 'draft' && (
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Stage 4: Few-Shot Paper Drafting
                </h3>
                <p className="text-xs text-slate-500">
                  Full 10-section paper conditioned on peer-reviewed few-shot demonstrations.
                </p>
              </div>
            </div>

            {draft && onProceedNext && (
              <button
                type="button"
                onClick={onProceedNext}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>Proceed to {nextStageName || 'Peer Review'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!draft ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Draft has not been generated yet. Complete Outline stage to draft the paper.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Paper Draft Generated Successfully
                  </span>
                  <span className="text-xs font-extrabold text-emerald-900 px-2 py-0.5 rounded bg-emerald-100">
                    {draft.wordCount?.toLocaleString() || '2,800'} words
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  {draft.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-3">
                  {draft.abstract}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Sections</span>
                  <span className="font-bold text-slate-800 text-sm">10 / 10</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Keywords</span>
                  <span className="font-bold text-slate-800 text-sm">{draft.keywords?.length || 6}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">References</span>
                  <span className="font-bold text-slate-800 text-sm">{draft.references?.length || 10}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Est. Read Time</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {Math.round((draft.wordCount || 2800) / 220)} min
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- STAGE 5: PEER REVIEW ---------------- */}
      {selectedStage === 'peer_review' && (
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Stage 5: Independent Double-Blind Peer Review
                </h3>
                <p className="text-xs text-slate-500">
                  Academic referee evaluation, criteria scoring rubric, strengths & revision vectors.
                </p>
              </div>
            </div>
          </div>

          {!peerReview ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Peer Review has not been conducted yet. Complete Stage 4 to evaluate the manuscript.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                    Editorial Board Recommendation
                  </span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    {peerReview.recommendation}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-lg">
                    {peerReview.concludingRemarks}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 self-start sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-indigo-200 block uppercase font-semibold">Overall Rigor</span>
                    <span className="text-xl font-black text-white">{peerReview.overallScore}</span>
                    <span className="text-xs text-indigo-200"> / 10.0</span>
                  </div>
                </div>
              </div>

              {/* Criteria scores breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.entries(peerReview.criteriaScores).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-base font-extrabold text-indigo-900 mt-1 block">
                      {val} <span className="text-xs font-normal text-slate-400">/ 10</span>
                    </span>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${(val / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths & Revisions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Key Scholarly Strengths
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {peerReview.keyStrengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Suggested Revisions & Caveats
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {peerReview.suggestedRevisions?.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ethical considerations */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Ethical & Reproducibility Considerations:
                </span>
                <p>{peerReview.ethicalConsiderations}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
