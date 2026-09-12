import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';
import mrCommon from './locales/mr/common.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    hi: { common: hiCommon },
    mr: { common: mrCommon },
  },
  lng: window.localStorage.getItem('kabadiwala-language') || 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'hi', 'mr'],
  load: 'languageOnly',
  returnNull: false,
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // React already safeguards from XSS
  },
});

i18n.on('languageChanged', (language) => {
  window.localStorage.setItem('kabadiwala-language', language);
});

export default i18n;
