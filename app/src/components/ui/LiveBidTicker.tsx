import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/formatPrice';

const LOTS = ['#A-118', '#B-204', '#C-077', '#D-391', '#E-256'];

export function LiveBidTicker() {
  const { t, i18n } = useTranslation('live');
  const [bidCents, setBidCents] = useState(248_00);
  const [lot, setLot] = useState(LOTS[0]);

  useEffect(() => {
    const id = setInterval(() => {
      setBidCents((prev) => prev + (Math.floor(Math.random() * 25) + 1) * 100);
      setLot(LOTS[Math.floor(Math.random() * LOTS.length)]);
    }, 1_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div data-testid="bid-ticker" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topBid.label')}</p>
      <p className="mt-2 font-mono text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(bidCents, i18n.language)}</p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('topBid.lot')} {lot}</p>
    </div>
  );
}
