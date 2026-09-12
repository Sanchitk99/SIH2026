export function localeFor(language: string) {
  if (language === 'hi') return 'hi-IN';
  if (language === 'mr') return 'mr-IN';
  return 'en-IN';
}

export function formatNumber(value: number, language: string) {
  return new Intl.NumberFormat(localeFor(language)).format(value);
}

export function formatCurrency(value: number, language: string) {
  return new Intl.NumberFormat(localeFor(language), { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
}

export function formatDate(value: string | number | Date, language: string) {
  return new Intl.DateTimeFormat(localeFor(language), { dateStyle: 'medium' }).format(new Date(value));
}
