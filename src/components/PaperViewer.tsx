import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileText,
  Bookmark,
  Share2,
  ExternalLink,
  MessageSquare,
  Award,
  ListOrdered,
  FileCode,
  BookMarked
} from 'lucide-react';
import { StructuredPaperDraft, PeerReviewResult, PaperRequest } from '../types/research';
import { generatePaperTxt, downloadFile, generateBibtex } from '../utils/exportUtils';

interface PaperViewerProps {
  draft: StructuredPaperDraft;
  peerReview?: PeerReviewResult;
  request?: PaperRequest;
  onOpenChat: () => void;
  onOpenPromptConfig: () => void;
}

export const PaperViewer: React.FC<PaperViewerProps> = ({
  draft,
  peerReview,
  request,
  onOpenChat,
  onOpenPromptConfig
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('abstract');
  const [showPeerReviewSummary, setShowPeerReviewSummary] = useState(false);

  const sections = [
    { id: 'abstract', title: 'Abstract & Keywords' },
    { id: 'introduction', title: '1. Introduction' },
    { id: 'objectives', title: '2. Research Objectives' },
    { id: 'literature', title: '3. Literature Review' },
    { id: 'methodology', title: '4. Methodology' },
    { id: 'findings', title: '5. Findings & Analysis' },
    { id: 'conclusion', title: '6. Conclusion' },
    { id: 'references', title: 'References' }
  ];

  const handleCopy = () => {
    const fullText = generatePaperTxt(draft, request, peerReview);
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = generatePaperTxt(draft, request, peerReview);
    const sanitizedTitle = draft.title
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 40)
      .toLowerCase();
    downloadFile(text, `research_paper_${sanitizedTitle}.txt`, 'text/plain');
  };

  const handleDownloadBibtex = () => {
    const bib = generateBibtex(draft);
    downloadFile(bib, `references.bib`, 'application/x-bibtex');
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const wordCount = draft.wordCount || 2800;
  const readingTime = Math.ceil(wordCount / 220);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Academic Toolbar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              ScholarForge Academic Manuscript
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>•</span>
            <span>{wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>~{readingTime} min read</span>
            <span>•</span>
            <span>{draft.references.length} citations</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {peerReview && (
            <button
              type="button"
              onClick={() => setShowPeerReviewSummary(!showPeerReviewSummary)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-900/60 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Score: {peerReview.overallScore}/10</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadBibtex}
            title="Export BibTeX citations"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            <BookMarked className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">BibTeX</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Paper (TXT)</span>
          </button>

          <button
            type="button"
            onClick={onOpenChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Follow-Up Q&amp;A</span>
          </button>
        </div>
      </div>

      {/* Peer Review Callout (Collapsible) */}
      {peerReview && showPeerReviewSummary && (
        <div className="bg-indigo-950 text-indigo-100 p-4 border-b border-indigo-900 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-400" />
              Double-Blind Peer Review Assessment: {peerReview.recommendation}
            </span>
            <span className="text-xs font-black bg-indigo-800 px-2.5 py-0.5 rounded text-white">
              Overall Rigor: {peerReview.overallScore} / 10
            </span>
          </div>
          <p className="text-xs text-indigo-200/90 leading-relaxed mb-2">
            {peerReview.concludingRemarks}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-indigo-900/40 p-2 rounded border border-indigo-800/60">
              <span className="font-bold text-emerald-300 block mb-0.5">Key Strengths:</span>
              <ul className="list-disc list-inside space-y-0.5 text-indigo-200 text-[11px]">
                {peerReview.keyStrengths?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-indigo-900/40 p-2 rounded border border-indigo-800/60">
              <span className="font-bold text-amber-300 block mb-0.5">Revision Points:</span>
              <ul className="list-disc list-inside space-y-0.5 text-indigo-200 text-[11px]">
                {peerReview.suggestedRevisions?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Reader Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Sticky Table of Contents */}
        <div className="hidden lg:block lg:col-span-3 border-r border-slate-200 p-5 bg-slate-50/60">
          <div className="sticky top-20">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
              <span>Table of Contents</span>
            </div>
            <nav className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollToSection(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeSection === s.id
                      ? 'bg-indigo-100/70 text-indigo-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={onOpenPromptConfig}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-slate-500" />
                <span>Inspect Prompt JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Academic Manuscript Paper Canvas */}
        <div className="lg:col-span-9 p-6 sm:p-10 lg:p-12 max-w-4xl mx-auto w-full">
          {/* Paper Header / Title & Authors */}
          <div className="text-center mb-8 pb-8 border-b border-slate-200">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
              {request?.field || 'Interdisciplinary Scholarly Paper'}
            </div>

            <h1 className="font-serif-paper text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
              {draft.title}
            </h1>

            <div className="text-xs text-slate-500 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <span className="font-semibold text-slate-700">ScholarForge Research Pipeline</span>
              <span>•</span>
              <span>Autonomous Academic Agent</span>
              <span>•</span>
              <span>Peer-Review Grounded</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Section: Abstract */}
          <section id="section-abstract" className="mb-8 p-5 sm:p-6 bg-slate-50/80 rounded-xl border border-slate-200">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 mb-2.5">
              Abstract
            </h2>
            <p className="font-serif-paper text-slate-800 text-base leading-relaxed text-justify mb-4">
              {draft.abstract}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700 mr-1">Keywords:</span>
              {draft.keywords?.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-medium shadow-2xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          </section>

          {/* Section: 1. Introduction */}
          <section id="section-introduction" className="mb-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 pb-2 mb-3 border-b border-slate-200">
              1. Introduction
            </h2>
            <div className="font-serif-paper text-slate-800 text-base leading-relaxed space-y-4 whitespace-pre-line text-justify">
              {draft.introduction}
            </div>
          </section>

          {/* Section: 2. Research Objectives */}
          <section id="section-objectives" className="mb-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 pb-2 mb-3 border-b border-slate-200">
              2. Research Objectives &amp; Hypotheses
            </h2>
            <div className="font-serif-paper text-slate-800 text-base leading-relaxed space-y-4 whitespace-pre-line text-justify bg-indigo-50/30 p-5 rounded-xl border border-indigo-100/80">
              {draft.researchObjectives}
            </div>
          </section>

          {/* Section: 3. Literature Review */}
          <section id="section-literature" className="mb-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 pb-2 mb-3 border-b border-slate-200">
              3. Literature Review &amp; Theoretical Framework
            </h2>
            <div className="font-serif-paper text-slate-800 text-base leading-relaxed space-y-4 whitespace-pre-line text-justify">
              {draft.literatureReview}
            </div>
          </section>

          {/* Section: 4. Methodology */}
          <section id="section-methodology" className="mb-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 pb-2 mb-3 border-b border-slate-200">
              4. Methodology &amp; Analytical Protocol
            </h2>
            <div className="font-serif-paper text-slate-800 text-base leading-relaxed space-y-4 whitespace-pre-line text-justify">
              {draft.methodology}
            </div>
          </section>

          {/* Section: 5. Findings */}
          <section id="section-findings" className="mb-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 pb-2 mb-3 border-b border-slate-200">
              5. Findings &amp; Empirical Discussion
            </h2>
            <div className="font-serif-paper text-slate-800 text-base leading-relaxed space-y-4 whitespace-pre-line text-justify">
              {draft.findings}
            </div>
          </section>

          {/* Section: 6. Conclusion */}
          <section id="section-conclusion" className="mb-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 pb-2 mb-3 border-b border-slate-200">
              6. Conclusion, Limitations &amp; Future Directions
            </h2>
            <div className="font-serif-paper text-slate-800 text-base leading-relaxed space-y-4 whitespace-pre-line text-justify">
              {draft.conclusion}
            </div>
          </section>

          {/* Section: References */}
          <section id="section-references" className="mb-8 pt-4 border-t-2 border-slate-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                References
              </h2>
              <button
                type="button"
                onClick={handleDownloadBibtex}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Export as BibTeX</span>
              </button>
            </div>

            <ol className="font-serif-paper text-slate-700 text-sm leading-relaxed space-y-2.5 list-none pl-0">
              {draft.references?.map((ref, idx) => (
                <li key={idx} className="flex items-start gap-2 text-justify">
                  <span className="font-mono text-xs font-semibold text-slate-400 min-w-[2rem]">
                    [{idx + 1}]
                  </span>
                  <span>{ref}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Bottom Export Callout */}
          <div className="mt-12 p-5 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Ready to publish or export?
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Download the complete paper as TXT, or download the prompt configuration JSON.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Paper (TXT)</span>
              </button>
              <button
                type="button"
                onClick={onOpenPromptConfig}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Prompt JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
