import { axiosClient } from '../api/axiosClient';
import type { ApiResponse } from '../types/api';

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export const categoryApi = {
  getCategories: async () => {
    const response = await axiosClient.get<ApiResponse<MaterialCategory[]>>('/categories/');
    return response.data;
  },
};
