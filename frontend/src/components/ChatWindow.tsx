import React, { useRef, useEffect } from 'react';
import { Menu, Loader2, Sparkles } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import { ExampleQuestions } from './ExampleQuestions';
import { MessageComposer } from './MessageComposer';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSendMessage: (question: string) => void;
  onToggleSidebar: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onToggleSidebar
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 min-w-0">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              Retail Sales Analytics Assistant
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5 text-teal-600" /> PostgreSQL Text-to-SQL
              </span>
            </h1>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Table: <span className="text-slate-600 font-semibold">public.retail_inventory</span>
        </div>
      </header>

      {/* Main Messages Viewport */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto h-full">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <ExampleQuestions onSelectQuestion={onSendMessage} disabled={isLoading} />
            </div>
          ) : (
            <div>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRetry={onSendMessage}
                />
              ))}

              {/* Loading Indicator Bubble */}
              {isLoading && (
                <div className="flex w-full justify-start mb-5">
                  <div className="flex max-w-[80%] gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-white border border-slate-200/90 px-4 py-3 shadow-sm flex items-center gap-2.5 text-xs text-slate-600">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
                      </span>
                      <span>Analyzing retail data & executing SQL query...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Composer */}
      <MessageComposer
        onSend={onSendMessage}
        isLoading={isLoading}
        disabled={false}
      />
    </div>
  );
};
