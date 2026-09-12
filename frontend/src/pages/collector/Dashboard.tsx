import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, PackagePlus, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { lotApi } from '../../services/lotApi';
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader, StatusBadge } from '../../components/ui/Primitives';
import type { MaterialLot } from '../../types/models';

export default function CollectorDashboard() {
  const { t } = useTranslation();
  const lotsQuery = useQuery({ queryKey: ['collectorLots'], queryFn: lotApi.getCollectorLots });
  const lots = lotsQuery.data?.data || [];
  const activeLots = lots.filter((lot: MaterialLot) => !['COMPLETED', 'CANCELLED'].includes(lot.status || ''));
  const quotedLots = lots.filter((lot: MaterialLot) => ['QUOTED', 'HANDOVER_PENDING'].includes(lot.status || ''));
  const completedLots = lots.filter((lot: MaterialLot) => lot.status === 'COMPLETED');
  return <>
    <PageHeader title={t('dashboard.collectorGreeting', { name: t('roles.COLLECTOR') })} description={t('dashboard.collectorDescription')} action={<Link to="/collector/lots/create"><Button><PackagePlus size={17} /> {t('dashboard.addFirstLot')}</Button></Link>} />
    <section className="metric-grid" aria-label={t('dashboard.collectorSummary')}>
      <Card className="metric-card metric-accent"><p className="metric-label">{t('dashboard.activeLots')}</p><p className="metric-value">{activeLots.length}</p><p className="metric-note">{t('dashboard.activeLotsNote')}</p></Card>
      <Card className="metric-card metric-accent amber"><p className="metric-label">{t('dashboard.attention')}</p><p className="metric-value">{quotedLots.length}</p><p className="metric-note">{t('dashboard.attentionNote')}</p></Card>
      <Card className="metric-card metric-accent cyan"><p className="metric-label">{t('dashboard.completedLots')}</p><p className="metric-value">{completedLots.length}</p><p className="metric-note">{t('dashboard.completedNote')}</p></Card>
    </section>
    <section className="section-heading"><div><h2>{t('dashboard.recentLots')}</h2><p>{t('dashboard.recentLotsDescription')}</p></div><Link to="/collector/lots" className="text-link">{t('dashboard.viewAllLots')} <ArrowRight size={14} /></Link></section>
    {lotsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : lotsQuery.isError ? <div className="error-state"><strong>{t('dashboard.loadErrorTitle')}</strong><p>{t('dashboard.loadErrorDescription')}</p><Button variant="secondary" onClick={() => void lotsQuery.refetch()}>{t('common.tryAgain')}</Button></div> : lots.length === 0 ? <EmptyState title={t('dashboard.firstListingTitle')} description={t('dashboard.firstListingDescription')} action={<Link to="/collector/lots/create"><Button><PackagePlus size={17} /> {t('dashboard.addFirstLot')}</Button></Link>} /> : <Card className="list-card" as="section">{lots.slice(0, 5).map((lot: MaterialLot) => <Link className="list-row" to="/collector/lots" key={lot.id}>{lot.images?.[0] ? <img className="lot-image" src={lot.images[0]} alt={`${lot.material_category_name || t('common.eWaste')} ${t('common.lot')}`} /> : <div className="lot-image lot-placeholder">{t('common.noImage')}</div>}<div className="list-row-main"><p className="list-row-title">{lot.material_category_name || t('common.uncategorised')}</p><p className="list-row-meta"><Scale size={12} /> {lot.approximate_weight ?? lot.weight_kg} {lot.weight_unit || t('common.kg')} · {lot.condition ? t(`createLot.${String(lot.condition).toLowerCase()}`, { defaultValue: lot.condition }) : t('common.conditionNotSpecified')} · <MapPin size={12} /> {lot.collection_location || t('common.locationPending')}</p></div><StatusBadge status={lot.status} /></Link>)}</Card>}
    <section className="notice-strip"><Badge tone="info">{t('dashboard.safetyFirst')}</Badge><p>{t('dashboard.safetyNotice')}</p><Link to="/collector/safety">{t('dashboard.readGuide')} <ArrowRight size={14} /></Link></section>
  </>;
}
