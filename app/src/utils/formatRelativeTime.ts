const localeMap: Record<string, string> = {
  en: 'en-US',
  pl: 'pl-PL',
  de: 'de-DE',
};

/**
 * Human "5 minutes ago" label. Locale-aware via Intl.RelativeTimeFormat.
 *
 * `nowMs` is passed in (not read from Date.now() here) so the caller controls
 * "now" — in VRT this is frozen by page.clock.setFixedTime(), which is what
 * makes the rendered label deterministic across runs.
 */
export function formatRelativeTime(iso: string, nowMs: number, lang: string): string {
  const locale = localeMap[lang] ?? 'en-US';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffMs = new Date(iso).getTime() - nowMs; // negative = in the past

  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');

  const hours = Math.round(diffMs / 3_600_000);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');

  const days = Math.round(diffMs / 86_400_000);
  return rtf.format(days, 'day');
}
