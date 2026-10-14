import React, { useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Loader2, Sparkles } from 'lucide-react';

interface MessageComposerProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  isLoading,
  disabled
}) => {
  const [text, setText] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea according to input content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="border-t border-obsidian-800/80 bg-obsidian-950/90 backdrop-blur-xl px-4 py-3.5 sm:px-6 z-20">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end rounded-2xl border border-obsidian-750 bg-obsidian-900/90 shadow-2xl focus-within:border-teal-500/60 focus-within:ring-1 focus-within:ring-teal-500/40 transition-all duration-200">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            placeholder="Ask about your retail data (e.g. top selling products, regional performance, demand gaps)..."
            className="w-full resize-none border-0 bg-transparent py-3.5 pl-4 pr-12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 max-h-32 disabled:opacity-50 font-normal leading-relaxed"
          />

          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading || disabled}
            className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white disabled:bg-obsidian-800 disabled:from-obsidian-800 disabled:to-obsidian-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all duration-200 shadow-glow-teal hover:scale-105 active:scale-95"
            title="Send Question (Enter)"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-teal-200" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between px-1.5 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>Grounded on 73,100 Supabase inventory & sales records</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-500">
            Press <CornerDownLeft className="w-2.5 h-2.5" /> to send, Shift+Enter for newline
          </span>
        </div>
      </div>
    </div>
  );
};
