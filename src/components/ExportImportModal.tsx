import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileJson, 
  RotateCcw, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Transaction, Budget, RecurringSubscription } from '../types';
import { exportToCSV, exportToJSON, parseCSVImport } from '../utils/formatters';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions: RecurringSubscription[];
  onImportTransactions: (imported: Transaction[]) => void;
  onResetData: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  budgets,
  subscriptions,
  onImportTransactions,
  onResetData,
}) => {
  if (!isOpen) return null;

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.transactions)) {
            onImportTransactions(parsed.transactions);
            setImportStatus(`Successfully imported ${parsed.transactions.length} transactions from JSON backup!`);
          } else if (Array.isArray(parsed)) {
            onImportTransactions(parsed);
            setImportStatus(`Successfully imported ${parsed.length} transactions!`);
          }
        } else {
          // CSV import
          const parsedTxs = parseCSVImport(content);
          if (parsedTxs.length > 0) {
            onImportTransactions(parsedTxs as Transaction[]);
            setImportStatus(`Successfully parsed and imported ${parsedTxs.length} transactions from CSV!`);
          } else {
            setImportStatus('Error: Could not parse transactions from CSV file.');
          }
        }
      } catch (err) {
        setImportStatus('Error reading file. Please ensure valid JSON or CSV format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Data Portability & Backup
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          
          {/* Status Message */}
          {importStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              importStatus.startsWith('Error') 
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200'
            }`}>
              {importStatus.startsWith('Error') ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
              <span>{importStatus}</span>
            </div>
          )}

          {/* Export Options */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
              Export Data
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => exportToCSV(transactions)}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs font-medium transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => exportToJSON({ transactions, budgets, subscriptions })}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs font-medium transition-colors"
              >
                <FileJson className="w-4 h-4 text-blue-600" />
                <span>Full JSON Backup</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
              Import from File
            </h4>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Select or Drop CSV / JSON File to Import</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                Reset Demo Data
              </div>
              <div className="text-[11px] text-zinc-400">
                Restore sample transactions & budgets
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset to initial sample dataset? Your current data will be overwritten.')) {
                  onResetData();
                  setImportStatus('Dataset successfully reset to default sample data.');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:bg-rose-950/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
