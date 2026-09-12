import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber';
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      className={`ui-button ui-button-${variant} ${className}`}
      disabled={loading || props.disabled}
    >
      {loading && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Card({ children, className = '', as: Component = 'section' }: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'article' | 'div' | 'aside';
}) {
  return <Component className={`ui-card ${className}`}>{children}</Component>;
}

export function Badge({ children, tone = 'neutral', className = '' }: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={`ui-badge ui-badge-${tone} ${className}`}>{children}</span>;
}

export function PageHeader({ title, description, action }: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{t('nav.workspace')}</p>
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  );
}

export function EmptyState({ title, description, action }: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  const { t } = useTranslation();
  return <div className="loading-state" role="status"><Loader2 size={20} className="animate-spin" /> {label === 'Loading...' ? t('common.loading') : label}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="error-state" role="alert">
      <strong>{t('errors.genericTitle')}</strong>
      <p>{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>{t('common.tryAgain')}</Button>}
    </div>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const { t } = useTranslation();
  const normalized = (status || 'UNKNOWN').toUpperCase();
  const tone: Tone = ['COMPLETED', 'ACCEPTED', 'VERIFIED', 'PAID', 'AVAILABLE'].includes(normalized)
    ? 'success'
    : ['REJECTED', 'CANCELLED', 'SUSPENDED'].includes(normalized)
      ? 'danger'
      : ['PENDING', 'QUOTED', 'HANDOVER_PENDING'].includes(normalized)
        ? 'warning'
        : 'neutral';
  const label = t(`status.${normalized}`, { defaultValue: normalized.replaceAll('_', ' ').toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase()) });
  return <Badge tone={tone}>{label}</Badge>;
}
