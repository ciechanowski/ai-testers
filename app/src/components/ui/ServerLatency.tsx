import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function ServerLatency() {
  const { t } = useTranslation('live');
  const [ms, setMs] = useState(42);

  useEffect(() => {
    const id = setInterval(() => {
      setMs(20 + Math.floor(Math.random() * 180));
    }, 2_000);
    return () => clearInterval(id);
  }, []);

  const tone = ms < 100 ? 'text-green-600 dark:text-green-400' : ms < 160 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

  return (
    <div data-testid="server-latency" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('latency.label')}</p>
      <p className={`mt-2 font-mono text-3xl font-bold ${tone}`}>{ms} ms</p>
    </div>
  );
}
