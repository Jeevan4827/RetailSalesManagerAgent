export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  data?: Array<Record<string, any>>;
  status?: 'sending' | 'success' | 'error';
  errorMessage?: string;
  timestamp: string;
}

export interface ChatResponsePayload {
  question: string;
  sql: string;
  answer: string;
  data: Array<Record<string, any>>;
}

export interface HealthResponsePayload {
  status: string;
  database: string;
  details?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SessionDetailPayload {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sql?: string;
    data?: Array<Record<string, any>>;
    timestamp: string;
  }>;
}
