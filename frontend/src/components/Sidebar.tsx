import { Store, Plus, Sparkles, HelpCircle, X, MessageSquare, Trash2, Clock, LayoutDashboard, MessageCircle } from 'lucide-react';
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
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 text-sm tracking-tight">RetailIQ</span>
                <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-teal-50 text-teal-700 rounded border border-teal-200">
                  Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Sales Intelligence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Navigation Switcher */}
        <div className="p-3 pb-0 space-y-1">
          <button
            type="button"
            onClick={() => {
              onSelectView('dashboard');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'dashboard'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-white' : 'text-teal-700'}`} />
            <span>Executive Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectView('chat');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'chat'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
            }`}
          >
            <MessageCircle className={`w-4 h-4 ${currentView === 'chat' ? 'text-white' : 'text-teal-700'}`} />
            <span>AI Chat Assistant</span>
          </button>
        </div>

        {/* New Chat Action (Shown in Chat mode or quick trigger) */}
        <div className="p-3">
          <button
            onClick={() => {
              onSelectView('chat');
              onNewChat();
              onClose();
            }}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs shadow-sm transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>


        {/* Scrollable List: Saved Chats + Suggested Queries */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {/* Saved Sessions History */}
          {sessions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                <span>Saved Chats</span>
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
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition select-none ${
                        isActive
                          ? 'bg-teal-50 text-teal-900 font-medium border border-teal-200/80'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-teal-600'}`} />
                        <span className="truncate">{sess.title}</span>
                      </div>
                      <button
                        onClick={(e) => onDeleteSession(sess.id, e)}
                        title="Delete Chat"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition shrink-0 ml-1"
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
            <div className="flex items-center gap-1.5 px-2 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <HelpCircle className="w-3 h-3" />
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
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 hover:text-teal-900 hover:bg-slate-100/80 transition flex items-start gap-2 group disabled:opacity-50"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-teal-600 mt-1.5 shrink-0 transition" />
                  <span className="line-clamp-2 leading-relaxed">{item.text}</span>
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
          <div className="px-4 py-2 bg-slate-100/60 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Powered by AI
            </span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
