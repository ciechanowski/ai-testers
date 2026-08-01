import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import type { ActivityEvent } from '../types/artwork';

const typeStyles: Record<string, string> = {
  sale: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  bid: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  listing: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  favorite: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

const typeIcon: Record<string, string> = {
  sale: '✓',
  bid: '↑',
  listing: '＋',
  favorite: '♥',
};

export function ActivityPage() {
  const { t, i18n } = useTranslation('activity');
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/activity')
      .then((r) => r.json())
      .then((data: ActivityEvent[]) => {
        if (active) setEvents(data);
      })
      .catch(() => {
        if (active) setEvents([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // "now" for relative labels. Frozen by page.clock in VRT → deterministic.
  const now = Date.now();

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
        {t('title')}
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{t('lead')}</p>

      {events === null ? (
        <p className="mt-8 text-gray-500 dark:text-gray-400">{t('loading')}</p>
      ) : events.length === 0 ? (
        <p className="mt-8 text-gray-500 dark:text-gray-400">{t('empty')}</p>
      ) : (
        <ul
          data-testid="activity-feed"
          className="mt-8 divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50"
        >
          {events.map((e) => (
            <li
              key={e.id}
              data-testid="activity-item"
              className="flex items-center gap-4 p-4"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${typeStyles[e.type]}`}
                aria-hidden="true"
              >
                {typeIcon[e.type]}
              </span>
              <img
                src={e.actorAvatar}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full bg-gray-100 dark:bg-gray-700"
              />
              <p className="min-w-0 flex-1 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {e.actorName}
                </span>{' '}
                {t(`verb.${e.type}`)}{' '}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {e.artworkTitle}
                </span>
              </p>
              <time
                dateTime={e.createdAt}
                className="shrink-0 text-xs text-gray-400 dark:text-gray-500"
              >
                {formatRelativeTime(e.createdAt, now, i18n.language)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
