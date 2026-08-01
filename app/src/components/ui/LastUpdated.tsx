import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function LastUpdated() {
  const { t } = useTranslation('live');
  const [mountedAt] = useState(() => Date.now());
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1_000);
    return () => clearInterval(id);
  }, []);

  const seconds = Math.max(0, Math.floor((Date.now() - mountedAt) / 1_000));

  return (
    <div data-testid="last-updated" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('lastUpdated.label')}</p>
      <p className="mt-2 font-mono text-3xl font-bold text-gray-900 dark:text-gray-100">{t('lastUpdated.value', { count: seconds })}</p>
    </div>
  );
}
