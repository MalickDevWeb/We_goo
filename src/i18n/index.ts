import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './es';
import fr from './fr';

const savedLang = (() => {
  try {
    return localStorage.getItem('wego-lang') || 'es';
  } catch {
    return 'es';
  }
})();

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    fr: { translation: fr },
  },
  lng: savedLang,
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem('wego-lang', lang);
  } catch {
    // Ignore storage errors (private mode / blocked storage)
  }
};

export default i18n;
