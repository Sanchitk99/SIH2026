import { axiosClient } from '../api/axiosClient';

export interface SubmitQuoteData {
  lot_id: string;
  quoted_price: number;
  pickup_available: boolean;
  estimated_pickup_date?: string;
}

export const quoteApi = {
  getQuotesForLot: async (lotId: string) => {
    const response = await axiosClient.get(`/quotes/lot/${lotId}`);
    return response.data;
  },

  submitQuote: async (data: SubmitQuoteData) => {
    const response = await axiosClient.post('/quotes', data);
    return response.data;
  },

  acceptQuote: async (quoteId: string) => {
    const response = await axiosClient.post(`/quotes/${quoteId}/accept`);
    return response.data;
  }
};