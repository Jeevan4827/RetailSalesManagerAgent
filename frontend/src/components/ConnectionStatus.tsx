import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface ConnectionStatusProps {
  connected: boolean;
  checking: boolean;
  details?: string;
  onRefresh: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connected,
  checking,
  details,
  onRefresh
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative border-t border-slate-800/80 p-3 bg-obsidian-900/70 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs">
        <div 
          className="flex items-center space-x-2.5 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="relative flex items-center justify-center">
            {connected ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px]">
              <Database className="w-3 h-3 text-teal-400" />
              {connected ? 'Supabase Live' : 'Offline'}
            </span>
            <span className="text-[10px] text-slate-400">
              {connected ? '73,100 records' : 'Check backend :8001'}
            </span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={checking}
          title="Retry Connection"
          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>

      {showTooltip && details && (
        <div className="absolute bottom-full left-3 mb-2 w-64 p-2.5 bg-slate-900/95 text-slate-200 text-[11px] rounded-xl shadow-glass border border-slate-700/80 z-50 pointer-events-none backdrop-blur-md">
          <div className="flex items-start gap-2">
            {connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{details}</span>
          </div>
        </div>
      )}
    </div>
  );
};
