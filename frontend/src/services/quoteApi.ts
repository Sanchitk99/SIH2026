import { axiosClient } from '../api/axiosClient';
import type { ApiResponse } from '../types/api';
import type { Quote } from '../types/models';

export interface SubmitQuoteData {
  lot_id: string;
  quoted_price: number;
  price_per_unit: number;
  pickup_available: boolean;
  estimated_pickup_date: string;
}

export const quoteApi = {
  getQuotesForLot: async (lotId: string) => {
    const response = await axiosClient.get<ApiResponse<Quote[]>>(`/quotes/lot/${lotId}`);
    return response.data;
  },

  submitQuote: async (data: SubmitQuoteData) => {
    const response = await axiosClient.post<ApiResponse<Quote>>('/quotes/', data);
    return response.data;
  },

  acceptQuote: async (quoteId: string) => {
    const response = await axiosClient.post<ApiResponse<Quote | { message: string }>>(`/quotes/${quoteId}/accept`);
    return response.data;
  }
};
