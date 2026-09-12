import { axiosClient } from '../api/axiosClient';
import type { ApiResponse, DashboardStats } from '../types/api';
import type { RecyclerRecord } from '../types/models';

export const adminApi = {
  getDashboardStats: async () => {
    const response = await axiosClient.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return response.data;
  },
  getPendingRecyclers: async () => {
    const response = await axiosClient.get<ApiResponse<RecyclerRecord[]>>('/admin/recyclers/pending');
    return response.data;
  },
  verifyRecycler: async (recyclerId: string) => {
    const response = await axiosClient.put<ApiResponse<{ uid: string; authorization_status: string }>>(`/admin/recyclers/${recyclerId}/authorize`, null, { params: { status: 'VERIFIED' } });
    return response.data;
  }
};
