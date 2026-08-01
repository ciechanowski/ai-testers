const currencyMap: Record<string, string> = {
  en: 'USD',
  pl: 'PLN',
  de: 'EUR',
};

const localeMap: Record<string, string> = {
  en: 'en-US',
  pl: 'pl-PL',
  de: 'de-DE',
};

export function formatPrice(cents: number, lang: string): string {
  const currency = currencyMap[lang] ?? 'USD';
  const locale = localeMap[lang] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
