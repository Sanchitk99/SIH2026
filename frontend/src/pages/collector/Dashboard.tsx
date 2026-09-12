import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, List, TrendingUp, AlertCircle } from 'lucide-react';
import { lotApi } from '../../services/lotApi';
import { useAuth } from '../../contexts/AuthContext';

export default function CollectorDashboard() {
  const navigate = useNavigate();
  const { backendUser } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['collectorLots'],
    queryFn: lotApi.getCollectorLots,
  });

  const lots = data?.data || [];
  const activeLots = lots.filter((lot: any) => lot.status !== 'COMPLETED' && lot.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-green-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Hello, {backendUser?.name?.split(' ')[0]}!</h1>
        <p className="text-green-100 mb-6">What would you like to recycle today?</p>
        
        <button 
          onClick={() => navigate('/collector/lots/create')}
          className="w-full bg-white text-green-700 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-50 transition-colors shadow-sm"
        >
          <PlusCircle size={24} /> Add E-Waste
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-2">
            <List size={24} />
          </div>
          <span className="text-2xl font-bold text-gray-800">{activeLots.length}</span>
          <span className="text-sm text-gray-500">Active Lots</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600 mb-2">
            <TrendingUp size={24} />
          </div>
          <span className="text-2xl font-bold text-gray-800">₹0</span>
          <span className="text-sm text-gray-500">Earnings</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Lots</h2>
          <button className="text-sm font-medium text-green-600 hover:text-green-700">View All</button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading lots...</div>
        ) : activeLots.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-3" size={32} />
            <p className="text-gray-600 font-medium">No active lots</p>
            <p className="text-sm text-gray-400 mt-1">Add your first e-waste item to get quotes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLots.slice(0, 3).map((lot: any) => (
              <div key={lot.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{lot.category_id}</p>
                  <p className="text-sm text-gray-500">{lot.weight_kg} kg • {lot.condition}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  {lot.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}