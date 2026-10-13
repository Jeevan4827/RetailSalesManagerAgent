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
    <div className="relative border-t border-slate-200/80 p-3 bg-slate-50/70">
      <div className="flex items-center justify-between text-xs">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="relative flex items-center justify-center">
            {connected ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
              </span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block"></span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-700 flex items-center gap-1">
              <Database className="w-3 h-3 text-slate-500" />
              {connected ? 'Supabase Connected' : 'Disconnected'}
            </span>
            <span className="text-[10px] text-slate-400">
              {connected ? '73,100 records' : 'Check backend on :8001'}
            </span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={checking}
          title="Retry Connection"
          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-teal-600' : ''}`} />
        </button>
      </div>

      {showTooltip && details && (
        <div className="absolute bottom-full left-3 mb-2 w-64 p-2 bg-slate-900 text-white text-[11px] rounded shadow-lg z-50 pointer-events-none">
          <div className="flex items-start gap-1.5">
            {connected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{details}</span>
          </div>
        </div>
      )}
    </div>
  );
};
