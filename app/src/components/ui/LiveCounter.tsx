import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function LiveCounter() {
  const { t } = useTranslation('home');
  const [count, setCount] = useState(427);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 3_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div data-testid="live-counter" className="inline-flex items-center gap-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
      </span>
      <span className="font-semibold">{count.toLocaleString()}</span>
      <span className="text-sm opacity-80">{t('visitors.label')}</span>
    </div>
  );
}
