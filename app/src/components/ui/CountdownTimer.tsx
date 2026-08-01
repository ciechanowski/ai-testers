import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const EXHIBITION_OFFSET_MS = 30 * 24 * 60 * 60 * 1_000;
const TARGET_DATE = new Date(Date.now() + EXHIBITION_OFFSET_MS);

export function CountdownTimer() {
  const { t } = useTranslation('home');

  const calcRemaining = () => {
    const diff = TARGET_DATE.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1_000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1_000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1_000 * 60)) % 60),
      seconds: Math.floor((diff / 1_000) % 60),
    };
  };

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    const interval = setInterval(() => setRemaining(calcRemaining()), 1_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div data-testid="countdown-timer" className="text-center">
      <h3 className="text-sm font-medium text-indigo-200 dark:text-indigo-300 mb-2">{t('countdown.heading')}</h3>
      <div className="flex items-center gap-1 text-white font-mono text-2xl font-bold">
        <span>{String(remaining.days).padStart(2, '0')}</span>
        <span className="text-indigo-300 text-lg">{t('countdown.days')}</span>
        <span className="mx-1">:</span>
        <span>{String(remaining.hours).padStart(2, '0')}</span>
        <span className="text-indigo-300 text-lg">{t('countdown.hours')}</span>
        <span className="mx-1">:</span>
        <span>{String(remaining.minutes).padStart(2, '0')}</span>
        <span className="text-indigo-300 text-lg">{t('countdown.minutes')}</span>
        <span className="mx-1">:</span>
        <span>{String(remaining.seconds).padStart(2, '0')}</span>
        <span className="text-indigo-300 text-lg">{t('countdown.seconds')}</span>
      </div>
    </div>
  );
}
