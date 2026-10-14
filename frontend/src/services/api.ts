import type { ChatResponsePayload, HealthResponsePayload } from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

export async function checkBackendHealth(): Promise<{ connected: boolean; details?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { connected: false, details: `HTTP status ${res.status}` };
    }

    const data: HealthResponsePayload = await res.json();
    return {
      connected: data.status === 'ok' && data.database === 'connected',
      details: data.details
    };
  } catch (error: any) {
    return {
      connected: false,
      details: error.name === 'AbortError' ? 'Connection timed out' : 'Backend offline or unreachable'
    };
  }
}

export async function sendChatMessage(question: string): Promise<ChatResponsePayload> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ question })
  });

  if (!res.ok) {
    let errorDetail = 'Failed to process request';
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' 
          ? errorJson.detail 
          : JSON.stringify(errorJson.detail);
      }
    } catch {
      errorDetail = `Request failed with status ${res.status} (${res.statusText})`;
    }
    throw new Error(errorDetail);
  }

  return await res.json();
}

export async function saveSession(messages: any[], title?: string, sessionId?: string | null): Promise<{ status: string; session_id: string; title: string }> {
  const res = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      session_id: sessionId || undefined,
      title,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sql: m.sql,
        data: m.data,
        timestamp: m.timestamp
      }))
    })
  });

  if (!res.ok) {
    throw new Error(`Failed to save chat session: status ${res.status}`);
  }

  return await res.json();
}

export async function fetchSessions(): Promise<Array<{ id: string; title: string; created_at: string; updated_at: string; message_count: number }>> {
  const res = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to load saved sessions: status ${res.status}`);
  }

  return await res.json();
}

export async function fetchSessionDetail(sessionId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to load session detail: status ${res.status}`);
  }

  return await res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to delete session: status ${res.status}`);
  }
}

export async function fetchDashboardAnalytics(filters?: Record<string, any>): Promise<any> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        params.append(key, String(val));
      }
    });
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/analytics/dashboard${queryString}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to load analytics dashboard: status ${res.status}`);
  }

  return await res.json();
}

export async function fetchAnalyticsRecords(options?: {
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<any> {
  const params = new URLSearchParams();
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        params.append(key, String(val));
      }
    });
  }
  if (options?.sortBy) params.append('sort_by', options.sortBy);
  if (options?.sortOrder) params.append('sort_order', options.sortOrder);
  if (options?.page) params.append('page', String(options.page));
  if (options?.pageSize) params.append('page_size', String(options.pageSize));
  if (options?.search) params.append('search', options.search);

  const res = await fetch(`${API_BASE_URL}/analytics/records?${params.toString()}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to load inventory records: status ${res.status}`);
  }

  return await res.json();
}

