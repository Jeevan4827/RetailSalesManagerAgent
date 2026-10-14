import React, { useRef, useEffect } from 'react';
import { Menu, Sparkles, Database } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import { ExampleQuestions } from './ExampleQuestions';
import { MessageComposer } from './MessageComposer';
import { LatticeLoader } from './LatticeLoader';

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
    <div className="flex-1 flex flex-col h-full bg-obsidian-950 min-w-0 text-slate-100 relative">
      {/* Top Header */}
      <header className="h-14 border-b border-obsidian-800/80 bg-obsidian-900/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-obsidian-800 transition"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Retail Intelligence Copilot
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                PostgreSQL Text-to-SQL
              </span>
            </h1>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-teal-400" />
          <span>Table:</span>
          <span className="text-teal-300 font-semibold px-2 py-0.5 rounded bg-obsidian-850 border border-obsidian-750">
            public.retail_inventory
          </span>
        </div>
      </header>

      {/* Main Messages Viewport */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
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

              {/* Loading Indicator Bubble with LatticeLoader */}
              {isLoading && (
                <div className="flex w-full justify-start mb-5 animate-in fade-in duration-200">
                  <div className="flex max-w-[85%] md:max-w-[75%] gap-3 items-start">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-glow-teal">
                      <Sparkles className="w-4 h-4 text-teal-100" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none glass-panel border border-teal-500/40 bg-obsidian-900/90 px-5 py-3.5 shadow-xl flex items-center gap-3 text-xs text-slate-200">
                      <LatticeLoader
                        status="working"
                        label="Synthesizing SQL & Grounding Answer"
                        doneLabel="Synthesized in"
                        pattern="orbit"
                        grid={3}
                        cellSize={5}
                        gap={2}
                        fontSize={12}
                        color="#2dd4bf"
                        glow={true}
                        glowColor="#14b8a6"
                        showTimer={true}
                      />
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
