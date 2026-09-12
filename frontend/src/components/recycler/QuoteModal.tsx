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
  
  const { register, handleSubmit, formState: { errors } } = useForm<SubmitQuoteData>({
    defaultValues: {
      lot_id: lotId,
      pickup_available: true,
    },
  });

  const mutation = useMutation({
    mutationFn: quoteApi.submitQuote,
    onSuccess: () => {
      // Invalidate the marketplace query so the available lots refresh
      queryClient.invalidateQueries({ queryKey: ['availableLots'] });
      onClose();
    },
  });

  const onSubmit = (data: SubmitQuoteData) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{t('submitQuote')}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {mutation.isError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
            Failed to submit quote. Please try again.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Quoted Price */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              {t('pricePerKg')}
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder="Enter amount in INR"
              {...register('quoted_price', { 
                required: 'Price is required', 
                min: { value: 1, message: 'Price must be greater than 0' } 
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" 
            />
            {errors.quoted_price && (
              <p className="text-red-500 text-xs mt-1">{errors.quoted_price.message}</p>
            )}
          </div>

          {/* Pickup Available Checkbox */}
          <div className="flex items-center gap-3 py-2">
            <input 
              type="checkbox" 
              id="pickup" 
              {...register('pickup_available')} 
              className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500" 
            />
            <label htmlFor="pickup" className="text-sm font-medium text-gray-700 cursor-pointer">
              {t('pickupAvailable')}
            </label>
          </div>

          {/* Estimated Pickup Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              {t('estimatedPickup')}
            </label>
            <input 
              type="date" 
              {...register('estimated_pickup_date')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" 
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending} 
              className="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Submitting...
                </>
              ) : (
                t('submit')
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}