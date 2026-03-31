/**
 * API Layer - Timi Admin Dashboard
 * Design: Dark Professional Dashboard
 * Base URL: configurable via VITE_API_BASE_URL env var
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: inject JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Types ============

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Profile {
  id: number;
  name: string;
  age?: number;
  height?: number;
  weight?: number;
  size?: string;
  photoUrl?: string;
  photoPath?: string;
  province?: string;
  city?: string;
  featured?: boolean;
  latitude?: number;
  longitude?: number;
  services?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppUser {
  id: number;
  accountId: string;
  nickname?: string;
  avatarUrl?: string;
  privacyEnabled?: boolean;
  invitedByAgentId?: number;
  invitedByAgentName?: string;
  inviteCodeId?: number;
  status: 'ACTIVE' | 'BANNED' | 'DISABLED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Agent {
  id: number;
  name: string;
  contact?: string;
  level: number;
  parentAgentId?: number;
  parentAgentName?: string;
  promoCode?: string;
  promoLink?: string;
  promoQrCode?: string;
  customerServiceEnabled?: boolean;
  status: 'ACTIVE' | 'DISABLED';
  remark?: string;
  subAgentCount?: number;
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatSession {
  id: number;
  appUserId: number;
  appUserNickname?: string;
  appUserAccountId?: string;
  agentId?: number;
  agentName?: string;
  status: 'OPEN' | 'CLOSED';
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  senderType: 'USER' | 'AGENT' | 'ADMIN';
  senderId: number;
  senderName?: string;
  content: string;
  messageType?: string;
  createdAt?: string;
}

export interface InviteCode {
  id: number;
  code: string;
  totalCount: number;
  usageCount: number;
  description?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DictionaryItem {
  id: number;
  dictType: string;
  dictKey: string;
  dictValue: string;
  parentId?: number;
  sortOrder?: number;
  latitude?: number;
  longitude?: number;
  children?: DictionaryItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Stats {
  totalProfiles: number;
  totalAppUsers: number;
  activeAppUsers: number;
  bannedAppUsers: number;
  totalAgents: number;
  activeAgents: number;
  totalInviteCodes: number;
  availableInviteCodes: number;
  openChatSessions: number;
  totalChatSessions: number;
}

// ============ Auth API ============
export const authApi = {
  adminLogin: (username: string, password: string) =>
    apiClient.post('/api/auth/login', { username, password }),
  // Note: backend uses /api/auth/login for admin login
};

// ============ Stats API ============
export const statsApi = {
  getStats: () => apiClient.get<Stats>('/api/admin/stats'),
};

// ============ Profile API ============
export const profileApi = {
  getProfiles: (page = 0, size = 10, name?: string, province?: string, city?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (name) params.append('name', name);
    if (province) params.append('province', province);
    if (city) params.append('city', city);
    return apiClient.get<PageResult<Profile>>(`/api/profiles?${params}`);
  },
  getProfile: (id: number) => apiClient.get<Profile>(`/api/profiles/${id}`),
  createProfile: (data: Partial<Profile>) => apiClient.post<Profile>('/api/profiles', data),
  updateProfile: (id: number, data: Partial<Profile>) => apiClient.put<Profile>(`/api/profiles/${id}`, data),
  deleteProfile: (id: number) => apiClient.delete(`/api/profiles/${id}`),
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ photoPath: string; message: string }>('/api/profiles/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Admin-specific profile management (same endpoints, admin token required)
  adminGetProfiles: (page = 0, size = 10, name?: string, province?: string, city?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (name) params.append('name', name);
    if (province) params.append('province', province);
    if (city) params.append('city', city);
    return apiClient.get<PageResult<Profile>>(`/api/profiles?${params}`);
  },
};

// ============ App User API ============
export const appUserApi = {
  getUsers: (page = 0, size = 10, nickname?: string, status?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (nickname) params.append('nickname', nickname);
    if (status) params.append('status', status);
    return apiClient.get<PageResult<AppUser>>(`/api/admin/app-users?${params}`);
  },
  getUser: (id: number) => apiClient.get<AppUser>(`/api/admin/app-users/${id}`),
  banUser: (id: number) => apiClient.put<AppUser>(`/api/admin/app-users/${id}/ban`),
  disableUser: (id: number) => apiClient.put<AppUser>(`/api/admin/app-users/${id}/disable`),
  enableUser: (id: number) => apiClient.put<AppUser>(`/api/admin/app-users/${id}/enable`),
};

// ============ Agent API ============
export const agentApi = {
  getAgents: (page = 0, size = 10, name?: string, level?: number) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (name) params.append('name', name);
    if (level !== undefined) params.append('level', String(level));
    return apiClient.get<PageResult<Agent>>(`/api/admin/agents?${params}`);
  },
  getAgent: (id: number) => apiClient.get<Agent>(`/api/admin/agents/${id}`),
  createAgent: (data: Partial<Agent>) => apiClient.post<Agent>('/api/admin/agents', data),
  updateAgent: (id: number, data: Partial<Agent>) => apiClient.put<Agent>(`/api/admin/agents/${id}`, data),
  deleteAgent: (id: number) => apiClient.delete(`/api/admin/agents/${id}`),
  getSubAgents: (id: number) => apiClient.get<Agent[]>(`/api/admin/agents/${id}/sub-agents`),
  toggleCustomerService: (id: number, enabled: boolean) =>
    apiClient.put<Agent>(`/api/admin/agents/${id}/customer-service`, { enabled }),
};

// ============ Chat API ============
export const chatApi = {
  getSessions: (page = 0, size = 20) =>
    apiClient.get<PageResult<ChatSession>>(`/api/admin/chat/sessions?page=${page}&size=${size}`),
  getSession: (id: number) => apiClient.get<ChatSession>(`/api/admin/chat/sessions/${id}`),
  getMessages: (sessionId: number) =>
    apiClient.get<ChatMessage[]>(`/api/admin/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: number, content: string, messageType = 'text') =>
    apiClient.post<ChatMessage>(`/api/admin/chat/sessions/${sessionId}/send`, { content, messageType }),
  // Note: backend AdminController uses /api/admin/chat/sessions/{id}/send
  closeSession: (sessionId: number) =>
    apiClient.put(`/api/admin/chat/sessions/${sessionId}/close`),
};

// ============ Invite Code API ============
export const inviteCodeApi = {
  getCodes: (page = 0, size = 10) =>
    apiClient.get<PageResult<InviteCode>>(`/api/invite-codes?page=${page}&size=${size}`),
  createCode: (data: Partial<InviteCode>) => apiClient.post<InviteCode>('/api/invite-codes', data),
  updateCode: (id: number, data: Partial<InviteCode>) =>
    apiClient.put<InviteCode>(`/api/invite-codes/${id}`, data),
  deleteCode: (id: number) => apiClient.delete(`/api/invite-codes/${id}`),
  resetCode: (id: number) => apiClient.post(`/api/invite-codes/${id}/reset`),
};

// ============ Dictionary API ============
export const dictionaryApi = {
  getByType: (type: string) => apiClient.get<DictionaryItem[]>(`/api/dictionaries/${type}`),
  getProvinces: () => apiClient.get<DictionaryItem[]>('/api/dictionaries/province'),
  getCities: (provinceId: number) =>
    apiClient.get<DictionaryItem[]>(`/api/dictionaries/city/${provinceId}`),
  create: (data: Partial<DictionaryItem>) => apiClient.post<DictionaryItem>('/api/dictionaries', data),
  update: (id: number, data: Partial<DictionaryItem>) =>
    apiClient.put<DictionaryItem>(`/api/dictionaries/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/dictionaries/${id}`),
  // Note: backend DictionaryController uses /api/dictionaries/{type} for GET by type
};

export default apiClient;
