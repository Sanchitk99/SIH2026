import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../../services/transactionApi';
import { FileText, CheckCircle, Clock } from 'lucide-react';

export default function CollectorTransactions() {
  const { data, isLoading } = useQuery({
    queryKey: ['collectorTransactions'],
    queryFn: transactionApi.getCollectorTransactions,
  });

  const transactions = data?.data || [];

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading transactions...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Transactions & Handovers</h1>

      {transactions.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500">
          <FileText className="mx-auto text-gray-400 mb-2" size={32} />
          No transactions recorded yet. Accept a quote to start a transaction.
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx: any) => (
            <div key={tx.id} className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold text-gray-800 text-lg">₹{tx.final_price || tx.agreed_price}</p>
                <p className="text-sm text-gray-500">Status: <span className="font-semibold text-green-600">{tx.status}</span></p>
                <p className="text-xs text-gray-400 mt-1">Ref: {tx.id}</p>
              </div>
              <div>
                {tx.status === 'COMPLETED' ? (
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">
                    <CheckCircle size={14} /> Completed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold">
                    <Clock size={14} /> In Progress
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}