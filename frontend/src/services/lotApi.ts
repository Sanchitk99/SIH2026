import { axiosClient } from '../api/axiosClient';
// 1. This is what your React Hook Form uses
export interface CreateLotData {
  category_id: string;
  weight_kg: number | string;
  condition: string;
  description?: string;
}

// 2. This is what the FastAPI backend expects
export interface LotApiPayload {
  material_category_id: string;
  material_category_name: string;
  material_description: string;
  approximate_weight: number;
  collection_location: string;
  latitude: number;
  longitude: number;
}

export const lotApi = {
  // 3. Update the parameter type to accept the new backend payload
  createLot: async (data: LotApiPayload) => {
    return axiosClient.post('/lots/', data);
  },
  
  uploadLotImage: async (lotId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`/upload/lots/${lotId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getCollectorLots: async () => {
    try {
      const response = await axiosClient.get('/lots/collector/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: [] }; 
      }
      throw error;
    }
  }
};

// import { axiosClient } from '../api/axiosClient';

// export interface CreateLotData {
//   category_id: string;
//   weight_kg: number;
//   condition: string;
//   description?: string;
//   latitude?: number;
//   longitude?: number;
// }

// export const lotApi = {
//   getCollectorLots: async () => {
//     const response = await axiosClient.get('/lots/collector/me');
//     return response.data;
//   },
  
//   createLot: async (data: CreateLotData) => {
//     const response = await axiosClient.post('/lots/', data);
//     return response.data;
//   },

//   uploadLotImage: async (lotId: string, file: File) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     const response = await axiosClient.post(`/upload/lots/${lotId}/image`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     });
//     return response.data;
//   }
// };