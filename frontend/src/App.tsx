import React, { useState, useEffect } from 'react';
import type { ChatMessage, ChatSession } from './types/chat';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { checkBackendHealth, sendChatMessage, saveSession, fetchSessions, fetchSessionDetail, deleteSession } from './services/api';

export const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Chat Sessions History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Database Connection Health State
  const [connected, setConnected] = useState<boolean>(false);
  const [checkingConnection, setCheckingConnection] = useState<boolean>(true);
  const [connectionDetails, setConnectionDetails] = useState<string | undefined>();

  const loadSessions = async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const verifyHealth = async () => {
    setCheckingConnection(true);
    const result = await checkBackendHealth();
    setConnected(result.connected);
    setConnectionDetails(result.details);
    setCheckingConnection(false);
  };

  useEffect(() => {
    verifyHealth();
    loadSessions();
    const interval = setInterval(verifyHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // When pressing New Chat, automatically save the existing conversation in DB (if it contains messages)
  const handleNewChat = async () => {
    if (isLoading) return;

    // If there are messages and this wasn't an already saved/opened session, save it
    if (messages.length > 0 && !activeSessionId) {
      try {
        await saveSession(messages);
        await loadSessions();
      } catch (err) {
        console.error('Failed to auto-save session on New Chat:', err);
      }
    }

    setMessages([]);
    setActiveSessionId(null);
  };

  const handleSelectSession = async (sessionId: string) => {
    if (isLoading) return;

    // If user has unsaved messages in the current conversation, save them before switching
    if (messages.length > 0 && !activeSessionId) {
      try {
        await saveSession(messages);
        await loadSessions();
      } catch (err) {
        console.error('Failed to auto-save active chat before switching:', err);
      }
    }

    try {
      setIsLoading(true);
      const detail = await fetchSessionDetail(sessionId);
      if (detail && detail.messages) {
        setMessages(
          detail.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            sql: m.sql,
            data: m.data,
            timestamp: m.timestamp || '',
            status: 'success'
          }))
        );
        setActiveSessionId(sessionId);
      }
    } catch (err) {
      console.error('Failed to load session detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setMessages([]);
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleSendMessage = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now() + 1}`;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      timestamp: now,
      status: 'success'
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(trimmed);

      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: response.answer,
        sql: response.sql,
        data: response.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'success'
      };

      const newMessagesList = [...messages, userMessage, assistantMessage];
      setMessages(newMessagesList);
      setConnected(true);

      // Auto-save the updated multi-turn conversation directly into Supabase
      try {
        const saveRes = await saveSession(newMessagesList, undefined, activeSessionId);
        if (saveRes && saveRes.session_id) {
          setActiveSessionId(saveRes.session_id);
          loadSessions();
        }
      } catch (err) {
        console.error('Failed to auto-save conversation turn:', err);
      }
    } catch (error: any) {
      const errorMessageText = error?.message || 'Failed to communicate with the retail agent backend.';
      
      const errorAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        status: 'error',
        errorMessage: errorMessageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        onSelectExample={handleSendMessage}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        connected={connected}
        checkingConnection={checkingConnection}
        connectionDetails={connectionDetails}
        onRefreshConnection={verifyHealth}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        disabled={isLoading}
      />

      {/* Main Chat Viewport */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
};

export default App;
