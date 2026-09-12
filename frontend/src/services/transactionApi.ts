import { axiosClient } from '../api/axiosClient';
import type { ApiResponse } from '../types/api';
import type { Transaction } from '../types/models';

export const transactionApi = {
  getCollectorTransactions: async () => {
    const response = await axiosClient.get<ApiResponse<Transaction[]>>('/transactions/');
    return response.data;
  },
  getRecyclerTransactions: async () => {
    const response = await axiosClient.get<ApiResponse<Transaction[]>>('/transactions/');
    return response.data;
  },
  confirmHandover: async (transactionId: string, data: HandoverData) => {
    const response = await axiosClient.post<ApiResponse<Transaction | { message: string }>>(`/transactions/${transactionId}/handover`, data);
    return response.data;
  }
};

export interface HandoverData {
  final_weight: number;
  final_price: number;
  handover_latitude: number;
  handover_longitude: number;
}
