import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { axiosClient } from '../../api/axiosClient';
import { MapPin, Scale, IndianRupee } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import QuoteModal from '../../components/recycler/QuoteModal';

export default function RecyclerDashboard() {
  const { t } = useTranslation();
  const { backendUser } = useAuth();
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['availableLots'],
    queryFn: async () => {
      const response = await axiosClient.get('/lots?status=AVAILABLE');
      return response.data;
    }
  });

  const availableLots = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('marketplace')}</h1>
          <p className="text-gray-500">{t('welcome')}, {backendUser?.name}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading available materials...</div>
      ) : availableLots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium">No materials available in your area right now.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableLots.map((lot: any) => (
            <div key={lot.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-40 bg-gray-100 flex items-center justify-center border-b border-gray-200">
                <span className="text-gray-400 font-medium">No Image</span>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-800">{lot.category_id}</h3>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">AVAILABLE</span>
                </div>
                
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-gray-600 flex items-center gap-2"><Scale size={16} className="text-gray-400"/> {lot.weight_kg} kg ({lot.condition})</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> Location pending</p>
                </div>

                <button 
                  onClick={() => setSelectedLotId(lot.id)}
                  className="w-full bg-white border-2 border-green-600 text-green-600 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-50"
                >
                  <IndianRupee size={18} /> {t('submitQuote')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLotId && <QuoteModal lotId={selectedLotId} onClose={() => setSelectedLotId(null)} />}
    </div>
  );
}