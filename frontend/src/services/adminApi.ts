import { axiosClient } from '../api/axiosClient';

export const adminApi = {
  getDashboardStats: async () => {
    const response = await axiosClient.get('/admin/dashboard');
    return response.data;
  },
  getPendingRecyclers: async () => {
    const response = await axiosClient.get('/admin/recyclers/pending');
    return response.data;
  },
  verifyRecycler: async (recyclerId: string) => {
    const response = await axiosClient.post(`/admin/recyclers/${recyclerId}/verify`);
    return response.data;
  }
};