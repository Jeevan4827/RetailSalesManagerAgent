import React from 'react';
import { 
  Store, 
  Plus, 
  Sparkles, 
  X, 
  MessageSquare, 
  Trash2, 
  Clock, 
  LayoutDashboard, 
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import { EXAMPLE_QUESTIONS } from './ExampleQuestions';
import type { ChatSession } from '../types/chat';

interface SidebarProps {
  currentView: 'chat' | 'dashboard';
  onSelectView: (view: 'chat' | 'dashboard') => void;
  onNewChat: () => void;
  onSelectExample: (question: string) => void;
  sessions: ChatSession[];
  activeSessionId?: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  connected: boolean;
  checkingConnection: boolean;
  connectionDetails?: string;
  onRefreshConnection: () => void;
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onNewChat,
  onSelectExample,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  connected,
  checkingConnection,
  connectionDetails,
  onRefreshConnection,
  isOpen,
  onClose,
  disabled
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-obsidian-900/95 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-glow-teal">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-tight">RetailIQ</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-teal-500/10 text-teal-300 rounded-full border border-teal-500/30">
                  BI AGENT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Sales & Inventory Intelligence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Navigation Switcher */}
        <div className="p-3 pb-0 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              onSelectView('dashboard');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'dashboard'
                ? 'bg-gradient-to-r from-teal-500/20 via-cyan-500/15 to-transparent text-teal-300 border border-teal-500/30 shadow-glow-teal'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-teal-400' : 'text-slate-400'}`} />
            <span>Executive Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectView('chat');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'chat'
                ? 'bg-gradient-to-r from-teal-500/20 via-cyan-500/15 to-transparent text-teal-300 border border-teal-500/30 shadow-glow-teal'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
            }`}
          >
            <MessageCircle className={`w-4 h-4 ${currentView === 'chat' ? 'text-teal-400' : 'text-slate-400'}`} />
            <span>AI Copilot (Text-to-SQL)</span>
          </button>
        </div>

        {/* New Chat Action */}
        <div className="p-3">
          <button
            onClick={() => {
              onSelectView('chat');
              onNewChat();
              onClose();
            }}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-500 hover:to-cyan-500 font-semibold text-xs shadow-glow-teal transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Scrollable List: Saved Chats + Suggested Queries */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {/* Saved Sessions History */}
          {sessions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock className="w-3 h-3 text-teal-400" />
                <span>Saved Conversations</span>
              </div>
              <div className="space-y-1">
                {sessions.map((sess) => {
                  const isActive = activeSessionId === sess.id;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => {
                        onSelectSession(sess.id);
                        onClose();
                      }}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all select-none border ${
                        isActive
                          ? 'bg-teal-500/15 text-teal-200 font-medium border-teal-500/40 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-400'}`} />
                        <span className="truncate">{sess.title}</span>
                      </div>
                      <button
                        onClick={(e) => onDeleteSession(sess.id, e)}
                        title="Delete Session"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition shrink-0 ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Example Inquiries List */}
          <div>
            <div className="flex items-center gap-1.5 px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              <span>Suggested Queries</span>
            </div>
            <div className="space-y-1">
              {EXAMPLE_QUESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectExample(item.text);
                    onClose();
                  }}
                  disabled={disabled}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 transition flex items-start gap-2.5 group disabled:opacity-50 border border-transparent hover:border-slate-800"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-teal-400 mt-1.5 shrink-0 transition" />
                  <span className="line-clamp-2 leading-relaxed text-[11px]">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info & Connection Status */}
        <div className="mt-auto">
          <ConnectionStatus
            connected={connected}
            checking={checkingConnection}
            details={connectionDetails}
            onRefresh={onRefreshConnection}
          />
          <div className="px-4 py-2.5 bg-obsidian-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Sparkles className="w-3 h-3 text-teal-400 animate-pulse" />
              Grounded AI Engine
            </span>
            <span className="text-[10px] font-mono text-slate-400">v2.0 PRO</span>
          </div>
        </div>
      </aside>
    </>
  );
};
