import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function SessionBadge() {
  const { t } = useTranslation('live');
  const [sid] = useState(() => Math.random().toString(16).slice(2, 10).toUpperCase());

  return (
    <div data-testid="session-id" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('session.label')}</p>
      <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-gray-900 dark:text-gray-100">{sid}</p>
    </div>
  );
}
