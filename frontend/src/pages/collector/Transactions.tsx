import { CheckCircle2, Clock3, Scale } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { transactionApi } from '../../services/transactionApi';
import { Button, Card, EmptyState, LoadingState, PageHeader, StatusBadge } from '../../components/ui/Primitives';
import type { Transaction } from '../../types/models';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function CollectorTransactions() {
  const { t, i18n } = useTranslation();
  const query = useQuery({ queryKey: ['collectorTransactions'], queryFn: transactionApi.getCollectorTransactions });
  const transactions = query.data?.data || [];

  return <>
    <PageHeader title={t('transactions.title')} description={t('transactions.description')} />
    {query.isLoading ? <LoadingState label={t('transactions.loading')} /> : query.isError ? <div className="error-state"><strong>{t('transactions.loadErrorTitle')}</strong><p>{t('transactions.loadErrorDescription')}</p><Button variant="secondary" onClick={() => void query.refetch()}>{t('common.tryAgain')}</Button></div> : transactions.length === 0 ? <EmptyState title={t('transactions.emptyTitle')} description={t('transactions.emptyDescription')} /> : <section className="transaction-list" aria-label={t('transactions.title')}>
      {transactions.map((transaction: Transaction) => {
        const weight = transaction.final_weight ?? transaction.approximate_weight;
        const price = transaction.final_price ?? transaction.quoted_price;
        const isPaid = transaction.payment_status === 'PAID';
        return <Card className="transaction-row" key={transaction.id} as="article">
          <div className="transaction-copy">
            <p className="eyebrow">{t('transactions.materialLabel')}</p>
            <h2>{transaction.material_category_name || t('common.eWaste')}</h2>
            {weight !== undefined && <p><Scale size={12} /> {t('transactions.weight', { value: `${weight} ${transaction.weight_unit || t('common.kg')}` })}</p>}
            {transaction.created_at && <p className="list-row-meta">{formatDate(transaction.created_at, i18n.language)}</p>}
          </div>
          <div className="transaction-row-right">
            {price !== undefined ? <span className="transaction-price">{formatCurrency(Number(price), i18n.language)}</span> : <span className="list-row-meta">{t('common.pricePending')}</span>}
            <StatusBadge status={transaction.transaction_status} />
            <span className="payment-status">{t('transactions.paymentStatus')}: {isPaid ? t('transactions.paymentReceived') : t('transactions.paymentPending')}</span>
            {transaction.transaction_status === 'COMPLETED' ? <span className="completion-note"><CheckCircle2 size={14} /> {t('transactions.completed')}</span> : <span className="completion-note pending"><Clock3 size={14} /> {t('transactions.handoverPending')}</span>}
          </div>
        </Card>;
      })}
    </section>}
  </>;
}
