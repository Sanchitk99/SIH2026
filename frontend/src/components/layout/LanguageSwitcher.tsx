import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage || i18n.language || 'en';

  return (
    <div className="language-switcher" role="group" aria-label={t('language.switcherLabel')}>
      <button type="button" className={activeLanguage === 'en' ? 'active' : ''} aria-pressed={activeLanguage === 'en'} onClick={() => void i18n.changeLanguage('en')}>
        {t('language.english')}
      </button>
      <button type="button" className={activeLanguage === 'hi' ? 'active' : ''} aria-pressed={activeLanguage === 'hi'} onClick={() => void i18n.changeLanguage('hi')}>
        {t('language.hindi')}
      </button>
      <button type="button" className={activeLanguage === 'mr' ? 'active' : ''} aria-pressed={activeLanguage === 'mr'} onClick={() => void i18n.changeLanguage('mr')}>
        {t('language.marathi')}
      </button>
    </div>
  );
}
