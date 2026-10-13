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
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-5`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-medium shadow-sm ${
            isUser ? 'bg-slate-700' : 'bg-teal-700'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message Bubble & Cards */}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm ${
              isUser
                ? 'bg-slate-900 text-white rounded-tr-none'
                : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
            }`}
          >
            {/* User or Error / Content Body */}
            {message.status === 'error' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-rose-600 font-medium text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Request Failed</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {message.errorMessage || 'An error occurred while communicating with the backend.'}
                </p>
                {onRetry && (
                  <button
                    onClick={() => onRetry(message.content)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Retry Question
                  </button>
                )}
              </div>
            ) : isUser ? (
              <div className="text-sm font-normal leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-sm prose-slate max-w-none text-slate-800 text-[13.5px] leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="my-2 overflow-x-auto rounded border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-xs" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-slate-100 font-medium text-slate-700" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="px-3 py-1.5 text-left font-semibold" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="px-3 py-1.5 border-t border-slate-100" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 space-y-1 my-1.5" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-5 space-y-1 my-1.5" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="my-1.5" {...props} />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Secondary Structured SQL, Charts & Tabular Data (Only for assistant messages) */}
          {!isUser && message.status !== 'error' && (
            <>
              {message.data && message.data.length > 1 && <ChartViewer data={message.data} />}
              {message.sql && <SqlViewer sql={message.sql} />}
              {message.data && message.data.length > 0 && <DataTable data={message.data} />}
            </>
          )}

          <span
            className={`text-[10px] text-slate-400 mt-1 px-1 ${
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
