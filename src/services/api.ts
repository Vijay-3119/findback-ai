import {
  LostItem,
  FoundItem,
  Match,
  Verification,
  DeliveryRecord,
  Organization,
  User,
  AiAttributes,
} from '../types/index.js';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const payload: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    error: { code: 'NETWORK_ERROR', message: 'Failed to parse JSON response' },
  }));

  if (!res.ok || payload.success === false) {
    const errorMsg = payload.error?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  // Support both enveloped { success: true, data: ... } and direct payloads
  return (payload.data !== undefined ? payload.data : payload) as T;
}

export const healthApi = {
  check: () => request<{ success: boolean; service: string; status: string; geminiConfigured: boolean }>('/api/health'),
};

export const usersApi = {
  getAll: () => request<User[]>('/api/users'),
  getById: (id: string) => request<User>(`/api/users/${id}`),
};

export const organizationsApi = {
  getAll: () => request<Organization[]>('/api/organizations'),
  getById: (id: string) => request<Organization>(`/api/organizations/${id}`),
};

export const lostItemsApi = {
  getAll: (params?: { userId?: string; organizationId?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<LostItem[]>(`/api/lost-items${q ? `?${q}` : ''}`);
  },
  getById: (id: string) => request<LostItem>(`/api/lost-items/${id}`),
  create: (data: Partial<LostItem>) =>
    request<{ item: LostItem; aiAttributes: AiAttributes; matches: Match[] }>('/api/lost-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const foundItemsApi = {
  getAll: (params?: { organizationId?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<FoundItem[]>(`/api/found-items${q ? `?${q}` : ''}`);
  },
  getById: (id: string) => request<FoundItem>(`/api/found-items/${id}`),
  create: (data: Partial<FoundItem>) =>
    request<{ item: FoundItem; aiAttributes: AiAttributes; matches: Match[] }>('/api/found-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const matchesApi = {
  getAll: (params?: { lostItemId?: string; foundItemId?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<Match[]>(`/api/matches${q ? `?${q}` : ''}`);
  },
  getById: (id: string) => request<Match>(`/api/matches/${id}`),
  create: (lostItemId: string, foundItemId: string) =>
    request<Match>('/api/matches', {
      method: 'POST',
      body: JSON.stringify({ lostItemId, foundItemId }),
    }),
  requestVerification: (matchId: string) =>
    request<{ match: Match; verification: Verification }>('/api/matches', {
      method: 'POST',
      body: JSON.stringify({ action: 'request_verification', matchId }),
    }),
  reject: (matchId: string) =>
    request<Match>('/api/matches', {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', matchId }),
    }),
  updateStatus: (id: string, status: string) =>
    request<Match>('/api/matches', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    }),
};

export const verificationApi = {
  getAll: (params?: { matchId?: string; userId?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<Verification[]>(`/api/verification${q ? `?${q}` : ''}`);
  },
  submitAnswer: (id: string, answer: string) =>
    request<Verification>('/api/verification', {
      method: 'POST',
      body: JSON.stringify({ action: 'submit_answer', id, answer }),
    }),
  adjudicate: (id: string, decision: 'approve' | 'request_info' | 'reject', adminNotes?: string) =>
    request<{ verification: Verification; match: Match | null }>('/api/verification', {
      method: 'POST',
      body: JSON.stringify({ action: 'adjudicate', id, decision, adminNotes }),
    }),
};

export const recoveryApi = {
  getAll: (params?: { matchId?: string; lostItemId?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<DeliveryRecord[]>(`/api/recovery${q ? `?${q}` : ''}`);
  },
  selectMethod: (id: string, method: 'pickup' | 'delivery', destinationAddress?: string) =>
    request<DeliveryRecord>('/api/recovery', {
      method: 'POST',
      body: JSON.stringify({ action: 'select_method', id, method, destinationAddress }),
    }),
  updateStatus: (id: string, status: string, description?: string, location?: string) =>
    request<DeliveryRecord>('/api/recovery', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_status', id, status, description, location }),
    }),
};

export const aiApi = {
  analyzeLostItem: (description: string, image?: string, category?: string, brand?: string, location?: string) =>
    request<AiAttributes>('/api/ai/analyze-lost-item', {
      method: 'POST',
      body: JSON.stringify({ description, image, category, brand, location }),
    }),
  analyzeFoundItem: (description: string, image?: string, location?: string, foundAt?: string) =>
    request<AiAttributes>('/api/ai/analyze-found-item', {
      method: 'POST',
      body: JSON.stringify({ description, image, location, foundAt }),
    }),
  matchItems: (lostItemId: string, foundItemId: string) =>
    request<any>('/api/ai/match-items', {
      method: 'POST',
      body: JSON.stringify({ lostItemId, foundItemId }),
    }),
};

export const demoApi = {
  reset: () => request<{ success: boolean; message: string }>('/api/reset-demo', { method: 'POST' }),
};
