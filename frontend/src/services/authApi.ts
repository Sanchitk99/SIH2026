import { axiosClient } from '../api/axiosClient';

export interface RegisterData {
  name: string;
  phone: string;
  role: 'COLLECTOR' | 'RECYCLER';
}

export const authApi = {
  registerBackendUser: async (data: RegisterData) => {
    const response = await axiosClient.post('/auth/register', data);
    return response.data;
  },
};