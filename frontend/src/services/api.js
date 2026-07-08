import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

const apiUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !apiUrl) {
  // A prod build with no VITE_API_URL would silently fall back to localhost and fail every request with
  // no clear error — fail loudly at load time instead so a missing env var is obvious immediately.
  throw new Error(
    'VITE_API_URL is not set. Set it as an environment variable in the Vercel project settings and redeploy.'
  );
}

const api = axios.create({
  baseURL: apiUrl || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000, // 10 s — prevents hanging requests
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const is401 = error.response?.status === 401;
    const isAuthRoute = error.config?.url?.includes('/auth/');

    if (is401 && !isAuthRoute) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);


export default api;
