import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function OnlineNow() {
  const { t } = useTranslation('live');
  const [count, setCount] = useState(73);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(60 + Math.floor(Math.random() * 40));
    }, 2_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div data-testid="online-now" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('onlineNow.label')}</p>
      <p className="mt-2 font-mono text-3xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
    </div>
  );
}
