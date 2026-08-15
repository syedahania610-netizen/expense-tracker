import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'N', desc: 'Focus Quick Add Title' },
  { key: '/', desc: 'Focus Search Filter' },
  { key: 'T', desc: 'Toggle Dark / Light Theme' },
  { key: '1', desc: 'Switch to Transactions Feed' },
  { key: '2', desc: 'Switch to Analytics & Charts' },
  { key: '3', desc: 'Switch to Budgets' },
  { key: '4', desc: 'Switch to Subscriptions' },
  { key: 'E', desc: 'Open Export / Backup' },
  { key: '?', desc: 'Show Keyboard Shortcuts' },
  { key: 'Esc', desc: 'Close any active dialog' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="flex items-center justify-between py-2 text-xs">
              <span className="text-zinc-600 dark:text-zinc-300">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono font-bold text-[11px] border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 text-center text-[11px] text-zinc-400">
          Press any key to execute instant navigation
        </div>
      </div>
    </div>
  );
};
