import { axiosClient } from '../api/axiosClient';

export const transactionApi = {
  getCollectorTransactions: async () => {
    const response = await axiosClient.get('/transactions/collector/me');
    return response.data;
  },
  getRecyclerTransactions: async () => {
    const response = await axiosClient.get('/transactions/recycler/me');
    return response.data;
  },
  confirmHandover: async (transactionId: string) => {
    const response = await axiosClient.post(`/transactions/${transactionId}/handover`);
    return response.data;
  }
};