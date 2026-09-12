import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { quoteApi, type SubmitQuoteData } from '../../services/quoteApi';
import { X, Loader2 } from 'lucide-react';

interface Props {
  lotId: string;
  onClose: () => void;
}

export default function QuoteModal({ lotId, onClose }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm<SubmitQuoteData>({
    defaultValues: { lot_id: lotId, pickup_available: true }
  });

  const mutation = useMutation({
    mutationFn: quoteApi.submitQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableLots'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t('submitQuote')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('pricePerKg')}</label>
            <input 
              type="number" 
              {...register('quoted_price', { required: true, min: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="pickup" {...register('pickup_available')} className="w-5 h-5 text-green-600 rounded" />
            <label htmlFor="pickup" className="text-sm font-medium text-gray-700">{t('pickupAvailable')}</label>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('estimatedPickup')}</label>
            <input 
              type="date" 
              {...register('estimated_pickup_date')}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">{t('cancel')}</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 flex justify-center items-center">
              {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}