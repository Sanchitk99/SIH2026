import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle2, MapPin, PackagePlus, Scale, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { lotApi } from '../../services/lotApi';
import { quoteApi } from '../../services/quoteApi';
import { Button, Card, EmptyState, LoadingState, PageHeader, StatusBadge } from '../../components/ui/Primitives';
import type { MaterialLot, Quote } from '../../types/models';
import { formatCurrency, formatDate } from '../../utils/formatters';

function getAcceptErrorKey(error: unknown) {
  if (axios.isAxiosError(error) && [400, 404, 409].includes(error.response?.status || 0)) return 'lots.offerUnavailable';
  return 'lots.acceptError';
}

export default function CollectorLots() {
  const { t, i18n } = useTranslation();
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [quoteToAccept, setQuoteToAccept] = useState<Quote | null>(null);
  const queryClient = useQueryClient();
  const lotsQuery = useQuery({ queryKey: ['collectorLots'], queryFn: lotApi.getCollectorLots });
  const quotesQuery = useQuery({ queryKey: ['lotQuotes', selectedLotId], queryFn: () => quoteApi.getQuotesForLot(selectedLotId as string), enabled: Boolean(selectedLotId) });
  const acceptMutation = useMutation({
    mutationFn: quoteApi.acceptQuote,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['collectorLots'] }),
        queryClient.invalidateQueries({ queryKey: ['lotQuotes', selectedLotId] }),
        queryClient.invalidateQueries({ queryKey: ['collectorTransactions'] }),
        queryClient.invalidateQueries({ queryKey: ['availableLots'] }),
      ]);
      setQuoteToAccept(null);
    },
  });
  const lots = lotsQuery.data?.data || [];
  const selectedLot = lots.find((lot: MaterialLot) => lot.id === selectedLotId);
  const quotes = quotesQuery.data?.data || [];

  useEffect(() => {
    if (!quoteToAccept) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !acceptMutation.isPending) setQuoteToAccept(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [acceptMutation.isPending, quoteToAccept]);

  return <>
    <PageHeader title={t('lots.title')} description={t('lots.description')} action={<Link to="/collector/lots/create"><Button><PackagePlus size={17} /> {t('lots.addLot')}</Button></Link>} />
    {lotsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : lotsQuery.isError ? <div className="error-state"><strong>{t('dashboard.loadErrorTitle')}</strong><p>{t('dashboard.loadErrorDescription')}</p><Button variant="secondary" onClick={() => void lotsQuery.refetch()}>{t('common.tryAgain')}</Button></div> : lots.length === 0 ? <EmptyState title={t('lots.noLotsTitle')} description={t('lots.noLotsDescription')} action={<Link to="/collector/lots/create"><Button><PackagePlus size={17} /> {t('lots.createLot')}</Button></Link>} /> : <div className="quote-layout">
      <Card className="list-card">
        {lots.map((lot: MaterialLot) => <button key={lot.id} type="button" className={`selectable-row ${selectedLotId === lot.id ? 'selected' : ''}`} aria-pressed={selectedLotId === lot.id} onClick={() => { setSelectedLotId(lot.id); acceptMutation.reset(); }}>
          {lot.images?.[0] ? <img className="lot-image" src={lot.images[0]} alt="" /> : <div className="lot-image lot-placeholder">{t('common.noImage')}</div>}
          <span className="list-row-main"><span className="list-row-title">{lot.material_category_name || t('common.uncategorised')}</span><span className="list-row-meta"><Scale size={12} /> {lot.approximate_weight ?? lot.weight_kg} {lot.weight_unit || t('common.kg')} · {lot.condition || t('lots.conditionPending')}</span></span>
          <StatusBadge status={lot.status} />
        </button>)}
      </Card>
      <Card className="quote-panel">
        {!selectedLot ? <div className="detail-placeholder"><h2>{t('lots.selectTitle')}</h2><p>{t('lots.selectDescription')}</p></div> : <>
          <div className="selected-lot-heading"><div><p className="eyebrow">{t('lots.selectedLot')}</p><h2>{selectedLot.material_category_name || t('common.uncategorised')}</h2><p>{selectedLot.approximate_weight} {selectedLot.weight_unit || t('common.kg')} · {selectedLot.condition || t('lots.conditionPending')}</p></div><StatusBadge status={selectedLot.status} /></div>
          <div className="detail-facts"><span><Scale size={14} /> {t('quotes.lotSummary', { weight: selectedLot.approximate_weight, unit: selectedLot.weight_unit || t('common.kg'), condition: selectedLot.condition || t('lots.conditionPending') })}</span><span><MapPin size={14} /> {selectedLot.collection_location || t('common.locationPending')}</span></div>
          {selectedLot.status === 'HANDOVER_PENDING' && <div className="success-note" role="status"><CheckCircle2 size={15} /> <span><strong>{t('lots.offerAccepted')}</strong> {t('lots.readyForHandover')}</span></div>}
          {acceptMutation.isError && <div className="form-alert" role="alert">{t(getAcceptErrorKey(acceptMutation.error))}</div>}
          <div className="section-heading compact"><div><h2>{t('lots.receivedOffers')}</h2><p>{t('lots.offerCount', { count: quotes.length })}</p></div></div>
          {quotesQuery.isLoading ? <LoadingState label={t('lots.offersLoading')} /> : quotesQuery.isError ? <div className="error-state"><strong>{t('lots.offersErrorTitle')}</strong><p>{t('lots.offersErrorDescription')}</p><Button variant="secondary" onClick={() => void quotesQuery.refetch()}>{t('common.tryAgain')}</Button></div> : quotes.length === 0 ? <div className="mini-empty"><p>{t('lots.noOffers')}</p><span>{t('lots.noOffersDescription')}</span></div> : <div className="quote-list">{quotes.map((quote: Quote) => <article className="quote-row" key={quote.id}>
            <div className="quote-row-main"><p className="quote-price">{formatCurrency(Number(quote.quoted_price || 0), i18n.language)}</p><p className="list-row-meta">{t('lots.recyclerLabel')}</p></div>
            <div className="quote-row-details"><span>{quote.pickup_available ? t('lots.pickupAvailable') : t('lots.pickupUnavailable')}</span><span>{t('lots.estimatedPickup')}: {quote.estimated_pickup_date ? formatDate(quote.estimated_pickup_date, i18n.language) : t('lots.dateNotProvided')}</span></div>
            <div className="quote-actions"><StatusBadge status={quote.status} />{quote.status === 'PENDING' && <Button loading={acceptMutation.isPending} onClick={() => { acceptMutation.reset(); setQuoteToAccept(quote); }}><CheckCircle2 size={15} /> {t('lots.acceptOffer')}</Button>}</div>
          </article>)}</div>}
        </>}
      </Card>
    </div>}
    {quoteToAccept && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !acceptMutation.isPending) setQuoteToAccept(null); }}>
      <section className="modal-card confirmation-card" role="dialog" aria-modal="true" aria-labelledby="accept-offer-title" aria-describedby="accept-offer-description">
        <div className="modal-heading"><div><p className="eyebrow">{t('lots.acceptOffer')}</p><h2 id="accept-offer-title">{t('lots.acceptOfferTitle')}</h2><p id="accept-offer-description">{t('lots.acceptOfferDescription')}</p></div><button autoFocus className="icon-button" type="button" onClick={() => setQuoteToAccept(null)} disabled={acceptMutation.isPending} aria-label={t('common.close')}><X size={18} /></button></div>
        <p className="confirmation-amount">{formatCurrency(Number(quoteToAccept.quoted_price || 0), i18n.language)}</p>
        <div className="form-actions"><Button type="button" variant="ghost" onClick={() => setQuoteToAccept(null)} disabled={acceptMutation.isPending}>{t('common.cancel')}</Button><Button type="button" loading={acceptMutation.isPending} onClick={() => acceptMutation.mutate(quoteToAccept.id)}>{t('lots.acceptOffer')}</Button></div>
      </section>
    </div>}
  </>;
}
