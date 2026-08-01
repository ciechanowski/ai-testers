import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../utils/formatPrice';
import artworksData from '../data/artworks.json';
import type { Artwork } from '../types/artwork';

const artworks = artworksData as Artwork[];
const topSale = [...artworks].sort((a, b) => b.priceCents - a.priceCents)[0]!;
const BUYERS = ['Mia K.', 'Jon R.', 'Ava P.', 'Leo M.', 'Zoe T.', 'Sam W.', 'Noa B.'];

/** Losowy feed sprzedaży generowany raz na mount → inny przy każdym załadowaniu. */
function buildFeed() {
  return Array.from({ length: 5 }, () => {
    const art = artworks[Math.floor(Math.random() * artworks.length)]!;
    const buyer = BUYERS[Math.floor(Math.random() * BUYERS.length)]!;
    return { key: Math.random().toString(36).slice(2), buyer, title: art.title, priceCents: art.priceCents };
  });
}

export function StudioPage() {
  const { t, i18n } = useTranslation('studio');

  // must_mask — losowe (Math.random), niezależne od zegara
  const [revenue, setRevenue] = useState(() => 480_000 + Math.floor(Math.random() * 40_000));
  const [viewers, setViewers] = useState(() => 60 + Math.floor(Math.random() * 180));
  const [conversion, setConversion] = useState(() => 2 + Math.random() * 4);
  const [session] = useState(() => Math.random().toString(16).slice(2, 10).toUpperCase());
  const [feed] = useState(buildFeed);

  // NIE maskować — czas zamrożony przez page.clock
  const [payoutTarget] = useState(() => Date.now() + 3 * 86_400_000 + 3 * 3_600_000 + 30 * 60_000);
  const [mountedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const a = setInterval(() => setRevenue((v) => v + Math.floor(Math.random() * 500)), 2_000);
    const b = setInterval(() => setViewers(60 + Math.floor(Math.random() * 180)), 2_000);
    const c = setInterval(() => setConversion(2 + Math.random() * 4), 3_000);
    const d = setInterval(() => setNow(Date.now()), 1_000);
    return () => [a, b, c, d].forEach(clearInterval);
  }, []);

  const left = Math.max(0, payoutTarget - now);
  const days = Math.floor(left / 86_400_000);
  const hours = Math.floor((left % 86_400_000) / 3_600_000);
  const mins = Math.floor((left % 3_600_000) / 60_000);
  const secs = Math.floor((left % 60_000) / 1_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const elapsed = Math.floor((now - mountedAt) / 1_000);

  const card = 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm';
  const label = 'text-sm font-medium text-gray-500 dark:text-gray-400';
  const value = 'mt-2 font-mono text-3xl font-bold text-gray-900 dark:text-gray-100';

  return (
    <section data-testid="studio-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{t('title')}</h1>
        <span data-testid="studio-pulse" className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          {t('badge')}
        </span>
        <span data-testid="studio-session" className="ml-auto font-mono text-xs text-gray-400 dark:text-gray-500">{t('session')}: {session}</span>
      </div>
      <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">{t('lead')}</p>

      {/* must_mask: losowe liczby */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div data-testid="studio-revenue" className={card}>
          <p className={label}>{t('revenue')}</p>
          <p className={`${value} text-indigo-600 dark:text-indigo-400`}>{formatPrice(revenue, i18n.language)}</p>
        </div>
        <div data-testid="studio-viewers" className={card}>
          <p className={label}>{t('viewers')}</p>
          <p className={value}>{viewers}</p>
        </div>
        <div data-testid="studio-conversion" className={card}>
          <p className={label}>{t('conversion')}</p>
          <p className={value}>{conversion.toFixed(1)}%</p>
        </div>
        {/* should_mask: dane ze statycznego JSON (stałe w teście) */}
        <div data-testid="studio-topsale" className={card}>
          <p className={label}>{t('topSale')}</p>
          <p className="mt-2 truncate text-lg font-semibold text-gray-900 dark:text-gray-100">{topSale.title}</p>
          <p className="font-mono text-sm text-brand-green">{formatPrice(topSale.priceCents, i18n.language)}</p>
        </div>
      </div>

      {/* NIE maskować: elementy czasowe zamraża page.clock */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 shadow-lg lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">{t('payout')}</p>
          <p data-testid="studio-payout" className="mt-2 font-mono text-4xl font-bold text-white">{days}d {pad(hours)}:{pad(mins)}:{pad(secs)}</p>
          <p data-testid="studio-updated" className="mt-3 text-xs text-indigo-200">{t('updated', { count: elapsed })}</p>
        </div>
        <div className={card}>
          <p className={label}>{t('clock')}</p>
          <p data-testid="studio-clock" className={value}>{new Date(now).toLocaleTimeString()}</p>
        </div>
      </div>

      {/* must_mask: losowa treść i kolejność */}
      <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('feed')}</h2>
        <ul data-testid="studio-feed" className="divide-y divide-gray-100 dark:divide-gray-700">
          {feed.map((e) => (
            <li key={e.key} className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-700 dark:text-gray-300"><span className="font-semibold text-gray-900 dark:text-gray-100">{e.buyer}</span> {t('bought')} <span className="font-medium text-indigo-600 dark:text-indigo-400">{e.title}</span></span>
              <span className="font-mono text-gray-500 dark:text-gray-400">{formatPrice(e.priceCents, i18n.language)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
