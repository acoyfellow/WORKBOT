// API client for GHL automation backend
const API_BASE = 'http://localhost:8001';

async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export interface Contact {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  dateAdded?: string;
  tags?: string[];
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName?: string;
  lastMessageDate?: string;
  lastMessageBody?: string;
  unreadCount?: number;
}

export interface Pipeline {
  id: string;
  name: string;
  stages?: { id: string; name: string }[];
}

export interface Workflow {
  id: string;
  name: string;
  status?: string;
}

export interface Activity {
  id: string;
  type: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  details?: string;
}

export async function getContacts(locationId: string, query = '', limit = 20) {
  const params = new URLSearchParams({ locationId, limit: String(limit) });
  if (query) params.set('query', query);
  const result = await api<{ data?: { contacts: Contact[]; meta?: { total?: number } }; contacts?: Contact[] }>(`/api/contacts?${params}`);
  // Handle both wrapped and unwrapped responses
  const contacts = result.data?.contacts || result.contacts || [];
  const total = result.data?.meta?.total;
  return { contacts, total };
}

export async function getConversations(locationId: string, limit = 20) {
  const params = new URLSearchParams({ locationId, limit: String(limit) });
  const result = await api<{ data?: { conversations: Conversation[] }; conversations?: Conversation[] }>(`/api/conversations?${params}`);
  return { conversations: result.data?.conversations || result.conversations || [] };
}

export async function getPipelines(locationId: string) {
  const result = await api<{ data?: { pipelines: Pipeline[] }; pipelines?: Pipeline[] }>(`/api/pipelines?locationId=${locationId}`);
  return { pipelines: result.data?.pipelines || result.pipelines || [] };
}

export async function getWorkflows(locationId: string) {
  const result = await api<{ data?: { workflows: Workflow[] }; workflows?: Workflow[] }>(`/api/workflows?locationId=${locationId}`);
  return { workflows: result.data?.workflows || result.workflows || [] };
}

export async function getActivities(locationId: string, options?: {
  type?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const params = new URLSearchParams({ locationId });
  if (options?.type) params.set('type', options.type);
  if (options?.startDate) params.set('startDate', options.startDate);
  if (options?.endDate) params.set('endDate', options.endDate);
  if (options?.limit) params.set('limit', String(options.limit));
  const result = await api<{ data?: { activities: Activity[] }; activities?: Activity[]; stats?: Record<string, number> }>(`/api/activities?${params}`);
  return { activities: result.data?.activities || result.activities || [], stats: result.stats };
}

export async function getStats(locationId: string) {
  const [contacts, conversations, opportunities] = await Promise.all([
    api<{ total?: number; contacts?: any[] }>(`/api/contacts?locationId=${locationId}&limit=1`),
    api<{ total?: number; conversations?: any[] }>(`/api/conversations?locationId=${locationId}&limit=1`),
    api<{ total?: number; opportunities?: any[] }>(`/api/opportunities?locationId=${locationId}&limit=1`),
  ]);
  return {
    contacts: contacts.total ?? contacts.contacts?.length ?? 0,
    conversations: conversations.total ?? conversations.conversations?.length ?? 0,
    opportunities: opportunities.total ?? opportunities.opportunities?.length ?? 0,
  };
}

export interface TokenStatus {
  valid: boolean;
  remaining: number;
  expiresAt: string;
}

export async function getTokenStatus(): Promise<TokenStatus> {
  const res = await api<{ token: TokenStatus }>('/api/status');
  return res.token;
}

export async function refreshToken(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/token/refresh-async`, { method: 'POST' });
  return res.json();
}
