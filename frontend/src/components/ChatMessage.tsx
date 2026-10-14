import React from 'react';
import { Bot, User, AlertCircle, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType } from '../types/chat';
import { SqlViewer } from './SqlViewer';
import { DataTable } from './DataTable';
import { ChartViewer } from './ChartViewer';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: (question: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[88%] md:max-w-[78%] gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-medium shadow-md transition-all ${
            isUser 
              ? 'bg-gradient-to-br from-slate-700 to-obsidian-800 border border-slate-600 text-slate-200' 
              : 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-glow-teal border border-teal-400/40'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message Bubble & Cards */}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            className={`rounded-2xl px-5 py-3.5 shadow-xl transition-all duration-200 ${
              isUser
                ? 'bg-gradient-to-r from-teal-950/80 via-obsidian-900 to-obsidian-900 border border-teal-500/30 text-slate-100 rounded-tr-none'
                : 'glass-panel bg-obsidian-900/85 border border-obsidian-800 text-slate-200 rounded-tl-none'
            }`}
          >
            {/* User or Error / Content Body */}
            {message.status === 'error' ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Analytical Execution Failed</span>
                </div>
                <p className="text-xs text-rose-300 leading-relaxed font-mono bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/20">
                  {message.errorMessage || 'An error occurred while communicating with the database or LLM agent.'}
                </p>
                {onRetry && (
                  <button
                    onClick={() => onRetry(message.content)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-teal-300 hover:text-white bg-teal-500/20 px-3 py-1.5 rounded-lg border border-teal-500/30 transition hover:bg-teal-500/30 shadow-sm"
                  >
                    <RotateCcw className="w-3 h-3 text-teal-400" />
                    Retry Analytical Inquiry
                  </button>
                )}
              </div>
            ) : isUser ? (
              <div className="text-sm font-normal leading-relaxed whitespace-pre-wrap text-slate-100">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none text-slate-200 text-[13.5px] leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="my-3 overflow-x-auto rounded-xl border border-obsidian-750 bg-obsidian-950/70 shadow-inner">
                        <table className="min-w-full divide-y divide-obsidian-800 text-xs" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-obsidian-900 font-medium text-slate-300" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="px-3.5 py-2 text-left font-semibold text-teal-300 uppercase tracking-wider text-[10px] font-mono" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="px-3.5 py-2 border-t border-obsidian-800/80 text-slate-300 font-mono text-[11px]" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 space-y-1.5 my-2 text-slate-300" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-5 space-y-1.5 my-2 text-slate-300" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="my-1.5 text-slate-200" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="text-white font-bold" {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code className="px-1.5 py-0.5 rounded bg-obsidian-950 border border-obsidian-800 text-teal-300 font-mono text-[11px]" {...props} />
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Secondary Structured SQL, Charts & Tabular Data (Only for assistant messages) */}
          {!isUser && message.status !== 'error' && (
            <div className="space-y-2 mt-1">
              {message.data && message.data.length > 1 && <ChartViewer data={message.data} />}
              {message.sql && <SqlViewer sql={message.sql} />}
              {message.data && message.data.length > 0 && <DataTable data={message.data} />}
            </div>
          )}

          <span
            className={`text-[10px] font-mono text-slate-500 mt-1.5 px-1 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};
