import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CalendarDays, CheckCircle2, IndianRupee, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { quoteApi, type SubmitQuoteData } from '../../services/quoteApi';
import { Button } from '../ui/Primitives';
import type { MaterialLot } from '../../types/models';
import { formatCurrency } from '../../utils/formatters';

interface OfferFormValues {
  quoted_price: number | string;
  pickup_available: 'yes' | 'no';
  estimated_pickup_date: string;
}

function getOfferErrorKey(error: unknown) {
  if (!axios.isAxiosError(error)) return 'quotes.offerError';
  if (error.response?.status === 409) return 'quotes.duplicateOffer';
  if (error.response?.status === 400 || error.response?.status === 404) return 'quotes.offerUnavailable';
  return 'quotes.offerError';
}

export default function QuoteModal({ lot, onClose }: { lot: MaterialLot; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { register, handleSubmit, control, setError, formState: { errors } } = useForm<OfferFormValues>({
    defaultValues: { pickup_available: 'yes', quoted_price: '', estimated_pickup_date: '' },
  });
  const totalOffer = useWatch({ control, name: 'quoted_price' });
  const weight = Number(lot.approximate_weight ?? lot.weight_kg);
  const calculatedRate = Number(totalOffer) > 0 && weight > 0 ? Number(totalOffer) / weight : null;
  const mutation = useMutation({
    mutationFn: quoteApi.submitQuote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['availableLots'] });
    },
  });

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const submitOffer = (data: OfferFormValues) => {
    const quotedPrice = Number(data.quoted_price);
    if (!Number.isFinite(quotedPrice) || quotedPrice <= 0 || !Number.isFinite(weight) || weight <= 0) {
      setError('quoted_price', { type: 'validate', message: t('quotes.validOffer') });
      return;
    }

    const payload: SubmitQuoteData = {
      lot_id: lot.id,
      quoted_price: quotedPrice,
      price_per_unit: quotedPrice / weight,
      pickup_available: data.pickup_available === 'yes',
      estimated_pickup_date: data.estimated_pickup_date,
    };
    mutation.mutate(payload);
  };

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="quote-title" aria-describedby="quote-summary">
      <div className="modal-heading">
        <div>
          <p className="eyebrow">{t('quotes.makeOffer')}</p>
          <h2 id="quote-title">{lot.material_category_name || t('common.eWaste')}</h2>
          <p id="quote-summary">{t('quotes.lotSummary', { weight: lot.approximate_weight ?? lot.weight_kg, unit: lot.weight_unit || t('common.kg'), condition: lot.condition || t('common.conditionNotSpecified') })}</p>
        </div>
        <button ref={closeButtonRef} className="icon-button" type="button" onClick={onClose} aria-label={t('quotes.closeForm')}><X size={18} /></button>
      </div>
      {mutation.isError && <div className="form-alert" role="alert">{t(getOfferErrorKey(mutation.error))}</div>}
      {mutation.isSuccess ? <div className="detail-placeholder" role="status"><CheckCircle2 size={28} color="#0d5c3a" /><h2>{t('quotes.offerSent')}</h2><p>{t('quotes.offerSentDescription')}</p><Button type="button" onClick={onClose}>{t('common.close')}</Button></div> : <form className="modal-form" onSubmit={handleSubmit(submitOffer)}>
        <label className="form-field">
          <span className="form-label"><IndianRupee size={13} /> {t('quotes.yourOffer')}</span>
          <input className="form-input" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder={t('quotes.offerPlaceholder')} {...register('quoted_price', { required: t('quotes.validOffer'), min: { value: 0.01, message: t('quotes.validOffer') }, validate: (value) => Number.isFinite(Number(value)) || t('quotes.validOffer') })} />
          {errors.quoted_price && <span className="field-error">{errors.quoted_price.message}</span>}
          {calculatedRate !== null && <span className="field-help">{t('quotes.calculatedRate', { amount: formatCurrency(calculatedRate, i18n.language) })}</span>}
        </label>
        <fieldset className="form-fieldset">
          <legend className="form-label">{t('quotes.pickupQuestion')}</legend>
          <div className="radio-options">
            <label className="radio-option"><input type="radio" value="yes" {...register('pickup_available')} /> <span>{t('quotes.pickupYes')}</span></label>
            <label className="radio-option"><input type="radio" value="no" {...register('pickup_available')} /> <span>{t('quotes.pickupNo')}</span></label>
          </div>
        </fieldset>
        <label className="form-field"><span className="form-label"><CalendarDays size={13} /> {t('quotes.estimatedPickupDate')}</span><input className="form-input" type="date" {...register('estimated_pickup_date', { required: t('quotes.dateRequired') })} />{errors.estimated_pickup_date && <span className="field-error">{errors.estimated_pickup_date.message}</span>}</label>
        <div className="form-actions"><Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button><Button type="submit" loading={mutation.isPending}>{t('quotes.submitOffer')}</Button></div>
      </form>}
    </section>
  </div>;
}
