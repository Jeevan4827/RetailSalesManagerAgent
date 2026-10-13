import React, { useState } from 'react';
import { Code2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

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
    <div className="mt-2.5 rounded-lg border border-slate-200/90 bg-slate-50/80 overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-slate-700 hover:bg-slate-100/70 transition select-none font-medium"
      >
        <div className="flex items-center gap-1.5 text-slate-600">
          <Code2 className="w-3.5 h-3.5 text-teal-600" />
          <span>Executed SQL</span>
        </div>
        <div className="flex items-center gap-2">
          {isOpen && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
              title="Copy SQL"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-teal-600" />
                  <span className="text-teal-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
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
        <div className="border-t border-slate-200/80 p-3 bg-slate-900 text-slate-100 font-mono text-[12px] leading-relaxed overflow-x-auto select-text">
          <pre className="whitespace-pre-wrap">{sql}</pre>
        </div>
      )}
    </div>
  );
};
