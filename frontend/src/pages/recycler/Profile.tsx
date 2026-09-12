import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { recyclerApi, type RecyclerProfileData } from '../../services/recyclerApi';
import { ShieldCheck, Clock, Loader2, Save } from 'lucide-react';

export default function RecyclerProfile() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<RecyclerProfileData>();

  const { isLoading } = useQuery({
    queryKey: ['recyclerProfile'],
    queryFn: async () => {
      const res = await recyclerApi.getProfile();
      reset(res.data);
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: recyclerApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recyclerProfile'] });
      alert('Profile updated successfully!');
    }
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Recycler Facility Profile</h1>
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
          <Clock size={14} /> Pending Verification
        </span>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Facility Name</label>
          <input {...register('facility_name')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Facility Address</label>
          <input {...register('facility_address')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
            <input {...register('city')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
            <input {...register('state')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contact Person</label>
            <input {...register('contact_person')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Authorization Number</label>
            <input {...register('authorization_number')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>

        <button type="submit" disabled={mutation.isPending} className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 transition-colors">
          {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}