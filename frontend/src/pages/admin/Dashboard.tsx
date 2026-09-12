import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { Users, ShieldCheck, FileCheck, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data: statsData } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getDashboardStats,
  });

  const { data: pendingData, isLoading } = useQuery({
    queryKey: ['pendingRecyclers'],
    queryFn: adminApi.getPendingRecyclers,
  });

  const verifyMutation = useMutation({
    mutationFn: adminApi.verifyRecycler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRecyclers'] });
    }
  });

  const stats = statsData?.data || {};
  const pendingRecyclers = pendingData?.data || [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Admin Control Center</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600"><Users size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total_users || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl text-green-600"><ShieldCheck size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Verified Recyclers</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.verified_recyclers || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-xl text-amber-600"><FileCheck size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Lots</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total_lots || 0}</h3>
          </div>
        </div>
      </div>

      {/* Recycler Verifications Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Pending Recycler Verifications</h2>

        {isLoading ? (
          <p className="text-gray-500">Loading pending requests...</p>
        ) : pendingRecyclers.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending recycler verifications.</p>
        ) : (
          <div className="space-y-4">
            {pendingRecyclers.map((recycler: any) => (
              <div key={recycler.uid} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-gray-50">
                <div>
                  <p className="font-bold text-gray-800">{recycler.name}</p>
                  <p className="text-sm text-gray-500">{recycler.email} • {recycler.phone}</p>
                  <span className="inline-block mt-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded">Pending Verification</span>
                </div>
                <button 
                  onClick={() => verifyMutation.mutate(recycler.uid)}
                  disabled={verifyMutation.isPending}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={16} /> Verify Recycler
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}