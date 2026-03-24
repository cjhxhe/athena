import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除并重定向到登录
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============ 认证 API ============

export const authApi = {
  /**
   * 验证邀请码
   */
  verifyCode: (code: string) =>
    apiClient.post('/api/auth/verify-code', { code }),

  /**
   * 管理员登录
   */
  adminLogin: (username: string, password: string) =>
    apiClient.post('/api/auth/login', { username, password }),
};

// ============ 列表 API ============

export interface Profile {
  id: number;
  name: string;
  age?: number;
  height?: number;
  weight?: number;
  size?: string;
  photoUrl?: string;
  photoPath?: string;  // 相对路径，用于上传到服务器的图片
  province?: string;  // 省份
  city?: string;
  featured?: boolean;  // 是否精选
  latitude?: number;
  longitude?: number;
  services?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  distance?: number | string;
}

export interface ProfilesResponse {
  content: Profile[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const profileApi = {
  /**
   * 获取列表（支持分页、搜索、筛选）
   */
  getProfiles: (page = 0, size = 10, name?: string, province?: string, city?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (name) params.append('name', name);
    if (province) params.append('province', province);
    if (city) params.append('city', city);
    return apiClient.get<any>(`/api/profiles?${params.toString()}`);
  },

  /**
   * 获取单个列表项详情
   */
  getProfile: (id: number) =>
    apiClient.get<Profile>(`/api/profiles/${id}`),

  /**
   * 计算距离
   */
  calculateDistance: (id: number, userLatitude: number, userLongitude: number) =>
    apiClient.post(`/api/profiles/${id}/distance`, {
      userLatitude,
      userLongitude,
    }),

  /**
   * 创建列表项（管理员）
   */
  createProfile: (profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Profile>('/api/profiles', profile),

  /**
   * 更新列表项（管理员）
   */
  updateProfile: (id: number, profile: Partial<Profile>) =>
    apiClient.put<Profile>(`/api/profiles/${id}`, profile),

  /**
   * 删除列表项（管理员）
   */
  deleteProfile: (id: number) =>
    apiClient.delete(`/api/profiles/${id}`),

  /**
   * 上传图片
   */
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ photoPath: string; message: string }>(
      '/api/profiles/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};

export default apiClient;
