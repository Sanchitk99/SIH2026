import { axiosClient } from '../api/axiosClient';

export interface CreateLotData {
  category_id: string;
  weight_kg: number;
  condition: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export const lotApi = {
  getCollectorLots: async () => {
    const response = await axiosClient.get('/lots/collector/me');
    return response.data;
  },
  
  createLot: async (data: CreateLotData) => {
    const response = await axiosClient.post('/lots', data);
    return response.data;
  },

  uploadLotImage: async (lotId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post(`/upload/lots/${lotId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};