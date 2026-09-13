import { axiosClient } from '../api/axiosClient';
import type { ApiResponse } from '../types/api';
import type { UploadResult } from '../types/api';

export interface RecyclerProfileData {
  facility_name: string;
  facility_address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  contact_person?: string;
  authorization_number?: string;
  pickup_available: boolean;
  service_area: number;
  authorization_status?: string;
  accepted_categories?: string[];
  rates?: MaterialRate[];
}

export interface MaterialRate {
  category_id: string;
  price_per_kg: number;
}

export interface RecyclerPreferences {
  accepted_categories: string[];
  rates: MaterialRate[];
}

export const recyclerApi = {
  getProfile: async () => {
    const response = await axiosClient.get<ApiResponse<RecyclerProfileData>>('/recycler/profile');
    return response.data;
  },
  updateProfile: async (data: RecyclerProfileData) => {
    const response = await axiosClient.put<ApiResponse<RecyclerProfileData>>('/recycler/profile', data);
    return response.data;
  },
  updatePreferences: async (data: RecyclerPreferences) => {
    const response = await axiosClient.post<ApiResponse<RecyclerPreferences>>('/recycler/preferences', data);
    return response.data;
  },
  uploadAuthorizationDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<ApiResponse<UploadResult>>('/upload/recycler/document', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
};
