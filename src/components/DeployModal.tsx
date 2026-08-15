import React, { useState } from 'react';
import { 
  X, 
  Github, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  Layers, 
  Zap, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitSnippet1 = `git init
git add .
git commit -m "feat: modern minimalist expense tracking application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main`;

  const vercelCliSnippet = `npm i -g vercel
vercel`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Push to GitHub & Deploy to Vercel
              </h3>
              <p className="text-xs text-zinc-500">
                Complete deployment guide with zero-config setup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-zinc-600 dark:text-zinc-300">
          
          {/* Option A: AI Studio 1-Click Export */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Direct 1-Click GitHub Export</span>
            </div>
            <p className="text-emerald-700 dark:text-emerald-400 mb-2">
              You can instantly export this codebase directly to your connected GitHub account via the AI Studio top-right settings menu:
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px] bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <span>Settings / Menu</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
              <span>Export to GitHub</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Select repository</span>
            </div>
          </div>

          {/* Step 1: Push via Git CLI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Step 1: Push Code to GitHub Repository
              </h4>
              <button
                onClick={() => copyToClipboard(gitSnippet1, 1)}
                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? 'Copied!' : 'Copy commands'}</span>
              </button>
            </div>

            <pre className="p-3 bg-zinc-900 dark:bg-zinc-950 text-zinc-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-800">
              {gitSnippet1}
            </pre>
          </div>

          {/* Step 2: Deploy to Vercel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Step 2: Deploy to Vercel (Web or CLI)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Web flow */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 space-y-2">
                <div className="font-semibold text-zinc-900 dark:text-white">
                  Method 1: Vercel Web Dashboard
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <li>Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">vercel.com/new</a></li>
                  <li>Click <strong>Import</strong> on your GitHub repo</li>
                  <li>Framework Preset: <strong>Vite / React</strong></li>
                  <li>Click <strong>Deploy</strong> — live in 30 seconds!</li>
                </ol>
              </div>

              {/* CLI flow */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-zinc-900 dark:text-white">
                    Method 2: Vercel CLI
                  </div>
                  <button
                    onClick={() => copyToClipboard(vercelCliSnippet, 2)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900"
                  >
                    {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <pre className="p-2 bg-zinc-900 dark:bg-zinc-950 text-zinc-200 rounded font-mono text-[10px]">
                  {vercelCliSnippet}
                </pre>
                <div className="text-[11px] text-zinc-400">
                  Runs interactive CLI and deploys immediately.
                </div>
              </div>

            </div>
          </div>

          {/* Build Configuration Info */}
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[11px] space-y-1">
            <div className="font-medium text-zinc-800 dark:text-zinc-200">
              Optimal Production Build Settings:
            </div>
            <div className="font-mono text-zinc-500 dark:text-zinc-400">
              Build Command: <code className="text-zinc-900 dark:text-white">npm run build</code> | Output Directory: <code className="text-zinc-900 dark:text-white">dist</code>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
          >
            <span>Open Vercel Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
