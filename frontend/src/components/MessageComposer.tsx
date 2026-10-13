import React, { useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Loader2 } from 'lucide-react';

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
    <div className="border-t border-slate-200/90 bg-white/95 backdrop-blur px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            placeholder="Ask about your retail data (e.g., top selling products, region sales)..."
            className="w-full resize-none border-0 bg-transparent py-3 pl-4 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 max-h-32 disabled:bg-slate-50"
          />

          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading || disabled}
            className="absolute right-2.5 bottom-2 p-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition shadow-sm"
            title="Send Question (Enter)"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span>Answers are based on your retail dataset (73,100 records).</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
            Press <CornerDownLeft className="w-2.5 h-2.5" /> to send, Shift+Enter for newline
          </span>
        </div>
      </div>
    </div>
  );
};
