import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, CheckCircle, Clock } from 'lucide-react';
import { lotApi } from '../../services/lotApi';
import { quoteApi } from '../../services/quoteApi';

export default function CollectorLots() {
  const queryClient = useQueryClient();
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  // Fetch Collector's Lots
  const { data: lotsData, isLoading: lotsLoading } = useQuery({
    queryKey: ['collectorLots'],
    queryFn: lotApi.getCollectorLots,
  });

  // Fetch Quotes for Selected Lot
  const { data: quotesData, isLoading: quotesLoading } = useQuery({
    queryKey: ['lotQuotes', selectedLotId],
    queryFn: () => quoteApi.getQuotesForLot(selectedLotId!),
    enabled: !!selectedLotId,
  });

  // Accept Quote Mutation
  const acceptQuoteMutation = useMutation({
    mutationFn: quoteApi.acceptQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectorLots'] });
      queryClient.invalidateQueries({ queryKey: ['lotQuotes', selectedLotId] });
      setSelectedLotId(null);
    }
  });

  const lots = lotsData?.data || [];
  const quotes = quotesData?.data || [];

  if (lotsLoading) return <div className="p-8 text-center text-gray-500">Loading your lots...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My E-Waste Lots</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Lots List */}
        <div className="space-y-4">
          {lots.map((lot: any) => (
            <div 
              key={lot.id} 
              onClick={() => setSelectedLotId(lot.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedLotId === lot.id ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 bg-white hover:border-green-300'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Package className={selectedLotId === lot.id ? 'text-green-600' : 'text-gray-400'} size={20} />
                  <h3 className="font-bold text-lg text-gray-800">{lot.category_id}</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-600">{lot.status}</span>
              </div>
              <p className="text-gray-500 text-sm">{lot.weight_kg} kg • {lot.condition}</p>
            </div>
          ))}
          {lots.length === 0 && <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-500">No lots found. Create one from the dashboard!</div>}
        </div>

        {/* Quotes Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Received Quotes</h2>
          
          {!selectedLotId ? (
            <p className="text-gray-500 text-center py-8">Select a lot to view its quotes.</p>
          ) : quotesLoading ? (
            <p className="text-gray-500 text-center py-8">Loading quotes...</p>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">No quotes received yet.</p>
              <p className="text-xs text-gray-400 mt-1">Recyclers will bid on your item soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote: any) => (
                <div key={quote.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-lg text-gray-800">₹{quote.quoted_price}</p>
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">{quote.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Recycler ID: {quote.recycler_id.substring(0,8)}...</p>
                  
                  {quote.status === 'PENDING' && (
                    <button 
                      onClick={() => acceptQuoteMutation.mutate(quote.id)}
                      disabled={acceptQuoteMutation.isPending}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700"
                    >
                      <CheckCircle size={18} /> Accept Quote
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}