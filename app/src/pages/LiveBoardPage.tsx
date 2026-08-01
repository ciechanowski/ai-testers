import { useTranslation } from 'react-i18next';
import { LiveCounter } from '../components/ui/LiveCounter';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { LiveBidTicker } from '../components/ui/LiveBidTicker';
import { OnlineNow } from '../components/ui/OnlineNow';
import { ServerLatency } from '../components/ui/ServerLatency';
import { SessionBadge } from '../components/ui/SessionBadge';
import { LastUpdated } from '../components/ui/LastUpdated';
import { formatPrice } from '../utils/formatPrice';
import artworksData from '../data/artworks.json';
import type { Artwork } from '../types/artwork';

const artworks = artworksData as Artwork[];
const floorCents = Math.min(...artworks.map((a) => a.priceCents));

export function LiveBoardPage() {
  const { t, i18n } = useTranslation('live');

  return (
    <section data-testid="live-board" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">{t('heading')}</h1>
        <span data-testid="live-pulse" className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          {t('badge')}
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">{t('lead')}</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <LiveBidTicker />
        <OnlineNow />
        <ServerLatency />
        <SessionBadge />
        <LastUpdated />
        <div data-testid="floor-price" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('floorPrice.label')}</p>
          <p className="mt-2 font-mono text-3xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(floorCents, i18n.language)}</p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-lg">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-indigo-100">{t('drop.heading')}</h2>
        <div className="mt-6 flex flex-col items-center justify-center gap-8 sm:flex-row">
          <CountdownTimer />
          <LiveCounter />
        </div>
      </div>
    </section>
  );
}
