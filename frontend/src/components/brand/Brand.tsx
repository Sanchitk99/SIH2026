import { Recycle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`} aria-label="Kabadiwala Connect">
      <span className="brand-mark"><Recycle size={compact ? 18 : 21} strokeWidth={2.5} /></span>
      <span className="brand-copy">
        <span className="brand-name">Kabadiwala<span>Connect</span></span>
        {!compact && <span className="brand-tagline">{t('brand.tagline')}</span>}
      </span>
    </div>
  );
}
