import { axiosClient } from '../api/axiosClient';

export interface RecyclerProfileData {
  facility_name: string;
  facility_address: string;
  city: string;
  state: string;
  contact_person: string;
  authorization_number: string;
  pickup_available: boolean;
  service_area: string;
}

export const recyclerApi = {
  getProfile: async () => {
    const response = await axiosClient.get('/recycler/profile');
    return response.data;
  },
  updateProfile: async (data: RecyclerProfileData) => {
    const response = await axiosClient.put('/recycler/profile', data);
    return response.data;
  }
};