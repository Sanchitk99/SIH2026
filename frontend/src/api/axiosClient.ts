import axios from 'axios';
import { auth } from '../firebase/config';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !auth.currentUser || error.config?.headers?.['X-Auth-Retry']) {
      return Promise.reject(error);
    }

    try {
      const token = await auth.currentUser.getIdToken(true);
      const config = error.config;
      if (!config) return Promise.reject(error);
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['X-Auth-Retry'] = '1';
      return axiosClient(config);
    } catch {
      return Promise.reject(error);
    }
  },
);
