import { AlertTriangle, BatteryWarning, CheckCircle2, Flame, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, PageHeader } from '../../components/ui/Primitives';

const safetyRules = [
  { titleKey: 'safety.doNotBurnTitle', descriptionKey: 'safety.doNotBurnDescription', icon: Flame, tone: 'danger' },
  { titleKey: 'safety.batteriesTitle', descriptionKey: 'safety.batteriesDescription', icon: BatteryWarning, tone: 'warning' },
  { titleKey: 'safety.keepDryTitle', descriptionKey: 'safety.keepDryDescription', icon: CheckCircle2, tone: 'success' },
  { titleKey: 'safety.separateTitle', descriptionKey: 'safety.separateDescription', icon: AlertTriangle, tone: 'info' },
];

export default function Safety() {
  const { t } = useTranslation(); const handleAudio = (text: string) => { if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); };
  return <><PageHeader title={t('safety.title')} description={t('safety.description')} /><section className="safety-list" aria-label={t('safety.ariaLabel')}>{safetyRules.map(({ titleKey, descriptionKey, icon: Icon, tone }) => { const title = t(titleKey); const description = t(descriptionKey); return <Card className={`safety-row safety-${tone}`} key={titleKey} as="article"><div className="safety-icon"><Icon size={21} /></div><div className="safety-copy"><h2>{title}</h2><p>{description}</p></div><button className="icon-button" onClick={() => handleAudio(`${title}. ${description}`)} aria-label={t('safety.listen', { title })}><Volume2 size={17} /></button></Card>; })}</section></>;
}
