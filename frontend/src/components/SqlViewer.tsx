import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Terminal } from 'lucide-react';

interface SqlViewerProps {
  sql: string;
}

export const SqlViewer: React.FC<SqlViewerProps> = ({ sql }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2.5 rounded-xl border border-obsidian-800 bg-obsidian-900/80 overflow-hidden text-xs shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-300 hover:bg-obsidian-850/80 transition select-none font-medium"
      >
        <div className="flex items-center gap-2 text-slate-300">
          <div className="p-1 rounded-md bg-teal-500/15 border border-teal-500/25 text-teal-400">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-xs text-white">Synthesized SQL Query</span>
          <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
            SELECT Read-Only
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isOpen && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono text-teal-300 bg-teal-500/10 border border-teal-500/25 hover:bg-teal-500/20 transition"
              title="Copy SQL"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-teal-400" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-obsidian-800/90 p-4 bg-[#050814] text-teal-300 font-mono text-[12px] leading-relaxed overflow-x-auto select-text shadow-inner">
          <pre className="whitespace-pre-wrap selection:bg-teal-500/30 selection:text-white">{sql}</pre>
        </div>
      )}
    </div>
  );
};
