import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CalendarDays, CheckCircle2, MapPin, Scale, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { transactionApi, type HandoverData } from '../../services/transactionApi';
import { Button, Card, EmptyState, LoadingState, PageHeader, StatusBadge } from '../../components/ui/Primitives';
import type { Transaction } from '../../types/models';
import { formatCurrency, formatDate } from '../../utils/formatters';

type HandoverForm = {
  final_weight: number | string;
  final_price: number | string;
  handover_latitude: number | null;
  handover_longitude: number | null;
};

function getHandoverErrorKey(error: unknown) {
  if (!axios.isAxiosError(error)) return 'transactions.handoverError';
  if (error.response?.status === 403) return 'transactions.handoverUnauthorized';
  if ([400, 404, 409].includes(error.response?.status || 0)) return 'transactions.handoverUnavailable';
  return 'transactions.handoverError';
}

export default function RecyclerTransactions() {
  const { t, i18n } = useTranslation();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [pendingHandover, setPendingHandover] = useState<HandoverData | null>(null);
  const [locationError, setLocationError] = useState('');
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['recyclerTransactions'], queryFn: transactionApi.getRecyclerTransactions });
  const transactions = query.data?.data || [];
  const { register, handleSubmit, reset, setError, setValue, control, formState: { errors } } = useForm<HandoverForm>({ defaultValues: { final_weight: '', final_price: '', handover_latitude: null, handover_longitude: null } });
  const latitude = useWatch({ control, name: 'handover_latitude' });
  const longitude = useWatch({ control, name: 'handover_longitude' });
  const mutation = useMutation({
    mutationFn: (data: HandoverData) => transactionApi.confirmHandover(selectedTransaction?.id as string, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['recyclerTransactions'] }),
        queryClient.invalidateQueries({ queryKey: ['collectorTransactions'] }),
        queryClient.invalidateQueries({ queryKey: ['collectorLots'] }),
        queryClient.invalidateQueries({ queryKey: ['availableLots'] }),
        queryClient.invalidateQueries({ queryKey: ['adminStats'] }),
      ]);
      setSelectedTransaction(null);
      setPendingHandover(null);
      reset();
      setSuccess(true);
    },
  });

  useEffect(() => {
    if (!selectedTransaction) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !mutation.isPending) {
        setSelectedTransaction(null);
        setPendingHandover(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mutation.isPending, selectedTransaction]);

  const captureLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError(t('transactions.locationUnsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setValue('handover_latitude', coords.latitude, { shouldValidate: true });
      setValue('handover_longitude', coords.longitude, { shouldValidate: true });
    }, () => setLocationError(t('transactions.locationError')), { enableHighAccuracy: true, timeout: 8000 });
  };

  const reviewHandover = (data: HandoverForm) => {
    const finalWeight = Number(data.final_weight);
    const finalPrice = Number(data.final_price);
    let valid = true;
    if (!Number.isFinite(finalWeight) || finalWeight <= 0) {
      setError('final_weight', { type: 'validate', message: t('transactions.finalWeightRequired') });
      valid = false;
    }
    if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
      setError('final_price', { type: 'validate', message: t('transactions.finalPriceRequired') });
      valid = false;
    }
    if (data.handover_latitude === null || data.handover_longitude === null) {
      setLocationError(t('transactions.coordinatesRequired'));
      valid = false;
    }
    if (!valid || data.handover_latitude === null || data.handover_longitude === null) return;
    setLocationError('');
    setPendingHandover({ final_weight: finalWeight, final_price: finalPrice, handover_latitude: data.handover_latitude, handover_longitude: data.handover_longitude });
  };

  const closeHandover = () => {
    if (mutation.isPending) return;
    setSelectedTransaction(null);
    setPendingHandover(null);
    setLocationError('');
    mutation.reset();
  };

  return <>
    <PageHeader title={t('transactions.handoversTitle')} description={t('transactions.handoversDescription')} />
    {success && <div className="success-note transaction-success" role="status"><CheckCircle2 size={15} /> <span><strong>{t('transactions.handoverCompleted')}</strong> {t('transactions.transactionCompleted')}</span></div>}
    {query.isLoading ? <LoadingState label={t('transactions.loadingHandovers')} /> : query.isError ? <div className="error-state"><strong>{t('transactions.handoversErrorTitle')}</strong><p>{t('transactions.handoversErrorDescription')}</p><Button variant="secondary" onClick={() => void query.refetch()}>{t('common.tryAgain')}</Button></div> : transactions.length === 0 ? <EmptyState title={t('transactions.emptyHandoversTitle')} description={t('transactions.emptyHandoversDescription')} /> : <section className="transaction-list" aria-label={t('transactions.handoversTitle')}>
      {transactions.map((transaction: Transaction) => {
        const weight = transaction.final_weight ?? transaction.approximate_weight;
        const price = transaction.final_price ?? transaction.quoted_price;
        return <Card className="transaction-row" key={transaction.id} as="article">
          <div className="transaction-copy">
            <p className="eyebrow">{t('transactions.materialLabel')}</p>
            <h2>{transaction.material_category_name || t('common.eWaste')}</h2>
            {weight !== undefined && <p><Scale size={12} /> {t('transactions.weight', { value: `${weight} ${transaction.weight_unit || t('common.kg')}` })}</p>}
            {transaction.pickup_available !== undefined && <p className="list-row-meta">{transaction.pickup_available ? t('transactions.pickupAvailable') : t('transactions.pickupUnavailable')}</p>}
            {transaction.estimated_pickup_date && <p className="list-row-meta"><CalendarDays size={12} /> {formatDate(transaction.estimated_pickup_date, i18n.language)}</p>}
            {transaction.created_at && <p className="list-row-meta">{formatDate(transaction.created_at, i18n.language)}</p>}
          </div>
          <div className="transaction-row-right">
            {price !== undefined ? <span className="transaction-price">{formatCurrency(Number(price), i18n.language)}</span> : <span className="list-row-meta">{t('common.pricePending')}</span>}
            <StatusBadge status={transaction.transaction_status} />
            <span className="payment-status">{t('transactions.paymentStatus')}: {transaction.payment_status === 'PAID' ? t('transactions.paymentReceived') : t('transactions.paymentPending')}</span>
            {transaction.transaction_status === 'HANDOVER_PENDING' && <Button variant="amber" onClick={() => { setSuccess(false); setLocationError(''); mutation.reset(); setSelectedTransaction(transaction); setPendingHandover(null); reset({ final_weight: transaction.final_weight ?? transaction.approximate_weight ?? '', final_price: transaction.final_price ?? transaction.quoted_price ?? '', handover_latitude: null, handover_longitude: null }); }}>{t('transactions.completeHandover')}</Button>}
          </div>
        </Card>;
      })}
    </section>}
    {selectedTransaction && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeHandover(); }}>
      <section className="modal-card handover-card" role="dialog" aria-modal="true" aria-labelledby="handover-title" aria-describedby="handover-description">
        <div className="modal-heading"><div><p className="eyebrow">{t('transactions.completeHandover')}</p><h2 id="handover-title">{selectedTransaction.material_category_name || t('common.eWaste')}</h2><p id="handover-description">{t('transactions.handoverInstructions')}</p></div><button autoFocus className="icon-button" type="button" onClick={closeHandover} disabled={mutation.isPending} aria-label={t('common.close')}><X size={18} /></button></div>
        {mutation.isError && <div className="form-alert" role="alert">{t(getHandoverErrorKey(mutation.error))}</div>}
        {pendingHandover ? <div className="handover-confirmation"><CheckCircle2 size={28} aria-hidden="true" /><h3>{t('transactions.confirmHandover')}</h3><p>{t('transactions.confirmHandoverDescription')}</p><div className="form-actions"><Button type="button" variant="ghost" onClick={() => setPendingHandover(null)} disabled={mutation.isPending}>{t('common.cancel')}</Button><Button type="button" loading={mutation.isPending} onClick={() => mutation.mutate(pendingHandover)}>{t('transactions.confirmComplete')}</Button></div></div> : <form className="modal-form" onSubmit={handleSubmit(reviewHandover)}>
          <label className="form-field"><span className="form-label">{t('transactions.finalWeightInput')}</span><input className="form-input" type="number" min="0.1" step="0.1" inputMode="decimal" {...register('final_weight', { required: t('transactions.finalWeightRequired'), min: { value: 0.1, message: t('transactions.finalWeightRequired') } })} />{errors.final_weight && <span className="field-error">{errors.final_weight.message}</span>}</label>
          <label className="form-field"><span className="form-label">{t('transactions.finalPriceInput')}</span><input className="form-input" type="number" min="0.01" step="0.01" inputMode="decimal" {...register('final_price', { required: t('transactions.finalPriceRequired'), min: { value: 0.01, message: t('transactions.finalPriceRequired') } })} />{errors.final_price && <span className="field-error">{errors.final_price.message}</span>}</label>
          <div className="form-field"><span className="form-label">{t('transactions.handoverLocation')}</span><p className="form-hint">{t('transactions.locationReason')}</p><div className="location-row"><div className={`location-display ${latitude !== null && longitude !== null ? 'captured' : ''}`} role="status"><MapPin size={16} />{latitude !== null && longitude !== null ? t('transactions.locationCaptured') : t('transactions.locationNeeded')}</div><Button type="button" variant="secondary" onClick={captureLocation}>{t('transactions.allowLocation')}</Button></div>{locationError && <span className="field-error" role="alert">{locationError}</span>}</div>
          <div className="form-actions"><Button type="button" variant="ghost" onClick={closeHandover}>{t('common.cancel')}</Button><Button type="submit">{t('transactions.reviewHandover')}</Button></div>
        </form>}
      </section>
    </div>}
  </>;
}
