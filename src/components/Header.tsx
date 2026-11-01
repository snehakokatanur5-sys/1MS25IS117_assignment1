import React from 'react';
import { BookOpen, Sparkles, FileCode, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenPromptConfig: () => void;
  apiHealthy: boolean | null;
  activePresetTitle?: string;
  onRunDiagnostic: () => void;
  isDiagnosticRunning: boolean;
  diagnosticResult: { latencyMs?: number; model?: string; success?: boolean } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPromptConfig,
  apiHealthy,
  activePresetTitle,
  onRunDiagnostic,
  isDiagnosticRunning,
  diagnosticResult
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-indigo-900/10">
              <BookOpen className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  ScholarForge<span className="text-indigo-600 font-extrabold ml-0.5">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Research Paper Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Autonomous 5-Stage Scholarly Pipeline with Few-Shot Conditioning
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Active preset indicator */}
            {activePresetTitle && (
              <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span className="truncate max-w-[150px]">{activePresetTitle}</span>
              </div>
            )}

            {/* Model Badge */}
            <div
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600"
              title="Primary model: gemini-3.1-flash-lite (high availability with 3x exponential backoff retries and fallback to gemini-3.8-flash)"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>gemini-3.1-flash-lite</span>
            </div>

            {/* Diagnostic Minimal Test Button */}
            <button
              onClick={onRunDiagnostic}
              disabled={isDiagnosticRunning}
              type="button"
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                diagnosticResult?.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
              } disabled:opacity-50`}
              title="Test a minimal Gemini text generation request to verify model availability in under 2 seconds"
            >
              {isDiagnosticRunning ? (
                <>
                  <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Testing API...</span>
                </>
              ) : diagnosticResult?.success ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified ({diagnosticResult.latencyMs}ms)</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            {/* API Status Badge */}
            <div
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium border ${
                apiHealthy === true
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : apiHealthy === false
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              title={apiHealthy ? 'Server API is connected' : 'Checking server connection'}
            >
              {apiHealthy === true ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="hidden sm:inline">
                {apiHealthy === true ? 'Server Active' : apiHealthy === false ? 'No API Key' : 'Connecting'}
              </span>
            </div>

            {/* Prompt Config Modal Trigger */}
            <button
              onClick={onOpenPromptConfig}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Prompt & Few-Shot Config</span>
              <span className="sm:hidden">Prompt</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
