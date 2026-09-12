import { axiosClient } from '../api/axiosClient';
import type { ApiResponse } from '../types/api';

export interface ClassificationResult {
  predicted_category: string;
  confidence_score: number;
  requires_manual_review: boolean;
}

export const aiApi = {
  classifyImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<ApiResponse<ClassificationResult>>('/ai/classify-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
};
