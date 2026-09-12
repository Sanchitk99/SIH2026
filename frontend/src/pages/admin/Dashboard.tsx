import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Package, ShieldCheck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../services/adminApi';
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader } from '../../components/ui/Primitives';
import type { RecyclerRecord } from '../../types/models';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const statsQuery = useQuery({ queryKey: ['adminStats'], queryFn: adminApi.getDashboardStats });
  const pendingQuery = useQuery({ queryKey: ['pendingRecyclers'], queryFn: adminApi.getPendingRecyclers });
  const verifyMutation = useMutation({ mutationFn: adminApi.verifyRecycler, onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['pendingRecyclers'] }); } });
  const stats = statsQuery.data?.data;
  const pending = pendingQuery.data?.data || [];
  const metricValues = { users: stats?.total_users_registered ?? 0, lots: stats?.total_lots_created ?? 0, completed: stats?.total_completed_transactions ?? 0 };

  return <>
    <PageHeader title={t('admin.title')} description={t('admin.description')} />
    {statsQuery.isLoading ? <LoadingState label={t('admin.loadingSummary')} /> : statsQuery.isError ? <div className="error-state" role="alert"><strong>{t('admin.requestsErrorTitle')}</strong><p>{t('admin.requestsErrorDescription')}</p><Button variant="secondary" onClick={() => void statsQuery.refetch()}>{t('common.tryAgain')}</Button></div> : <section className="metric-grid admin-stat-grid" aria-label={t('admin.summaryLabel')}>
      <Card className="metric-card metric-accent"><p className="metric-label"><Users size={14} /> {t('admin.registeredUsers')}</p><p className="metric-value">{metricValues.users}</p><p className="metric-note">{t('admin.registeredUsersNote')}</p></Card>
      <Card className="metric-card metric-accent amber"><p className="metric-label"><Package size={14} /> {t('admin.lotsCreated')}</p><p className="metric-value">{metricValues.lots}</p><p className="metric-note">{t('admin.lotsCreatedNote')}</p></Card>
      <Card className="metric-card metric-accent cyan"><p className="metric-label"><ShieldCheck size={14} /> {t('admin.completedTransactions')}</p><p className="metric-value">{metricValues.completed}</p><p className="metric-note">{t('admin.completedTransactionsNote')}</p></Card>
    </section>}
    <section className="section-heading"><div><h2>{t('admin.verificationTitle')}</h2><p>{t('admin.verificationDescription')}</p></div>{pending.length > 0 && <Badge tone="warning">{t('admin.pendingCount', { count: pending.length })}</Badge>}</section>
    {pendingQuery.isLoading ? <LoadingState label={t('admin.loadingRequests')} /> : pendingQuery.isError ? <div className="error-state" role="alert"><strong>{t('admin.requestsErrorTitle')}</strong><p>{t('admin.requestsErrorDescription')}</p><Button variant="secondary" onClick={() => void pendingQuery.refetch()}>{t('common.tryAgain')}</Button></div> : pending.length === 0 ? <EmptyState title={t('admin.nothingToReview')} description={t('admin.nothingToReviewDescription')} /> : <Card className="admin-table-wrap">
      {verifyMutation.isError && <div className="form-alert" role="alert">{t('errors.genericTitle')}</div>}
      <table className="admin-table"><caption className="sr-only">{t('admin.pendingCaption')}</caption><thead><tr><th>{t('admin.facility')}</th><th>{t('admin.contact')}</th><th>{t('admin.location')}</th><th>{t('admin.status')}</th><th><span className="sr-only">{t('admin.actions')}</span></th></tr></thead><tbody>{pending.map((recycler: RecyclerRecord) => <tr key={recycler.uid}><td data-label={t('admin.facility')}><strong>{recycler.facility_name || recycler.name || t('admin.unnamedFacility')}</strong><span>{recycler.authorization_number || t('admin.authorizationMissing')}</span></td><td data-label={t('admin.contact')}>{recycler.email || '—'}<span>{recycler.phone || '—'}</span></td><td data-label={t('admin.location')}>{[recycler.city, recycler.state].filter(Boolean).join(', ') || t('admin.locationMissing')}</td><td data-label={t('admin.status')}><Badge tone="warning">{t('admin.pendingReview')}</Badge></td><td data-label={t('admin.actions')}><div className="admin-action-group"><Button loading={verifyMutation.isPending} onClick={() => verifyMutation.mutate(recycler.uid)}><CheckCircle2 size={15} /> {t('admin.verify')}</Button></div></td></tr>)}</tbody></table>
    </Card>}
  </>;
}
