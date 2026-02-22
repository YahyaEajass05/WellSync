import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../constants';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Try direct token first, then Zustand persisted auth-storage
      let token = localStorage.getItem('token');
      if (!token) {
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            token = parsed?.state?.token || null;
          }
        } catch {}
      }
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = (error.config as any)?.url ?? '';
      // Do NOT redirect for account-deletion endpoint — a wrong confirmation
      // password returns 400 from the backend, but guard here too so that
      // any future change to that route never accidentally logs the user out
      // while they are still on the page trying to type the right password.
      const isAccountDeletion = url.includes('/users/account');

      if (!isAccountDeletion && typeof window !== 'undefined') {
        // Real session expiry — clear stored credentials and send to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
