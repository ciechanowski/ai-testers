import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../utils/formatPrice';

interface InsightRow {
  id: string;
  title: string;
  category: string;
  views: number;
  favorites: number;
  revenueCents: number;
}

/**
 * Creator Insights — playground zadania domowego S03L04.
 *
 * Spina cały Dzień 3 na jednej stronie: dane z /api/insights dryfują przy każdym
 * żądaniu (page.route + factory, L01), wykres SVG ma gradient i antyaliasing
 * (threshold, B01), filtry i tabela proszą się o Page Object (L02), a ceny i daty
 * są tu sygnałem per locale — cel dla skilla vrt-i18n (L03).
 *
 * Uwaga na różnicę względem /payouts (S02L04): tam niemiecki ŁAMIE layout i to jest
 * bug. Tutaj język zmienia wyłącznie formatowanie — $551.00 kontra 551,00 €,
 * "Jun 17, 2026" kontra "17. Juni 2026". To sygnał, nie regresja, i dlatego tych
 * elementów się NIE maskuje.
 */
export function InsightsPage() {
  const { t, i18n } = useTranslation('insights');
  const [rows, setRows] = useState<InsightRow[] | null>(null);

  // must_mask — losowy identyfikator zadania, inny przy każdym mount
  const [jobId] = useState(() => Math.random().toString(16).slice(2, 10).toUpperCase());

  // NIE maskować — czas zamraża page.clock
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    fetch('/api/insights')
      .then((r) => r.json())
      .then((data: InsightRow[]) => {
        if (active) setRows(data);
      })
      .catch(() => {
        if (active) setRows([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const dateFmt = new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const periodTo = dateFmt.format(new Date(now));
  const periodFrom = dateFmt.format(new Date(now - 30 * 86_400_000));
  const generatedAt = new Date(now).toLocaleTimeString();

  const totalRevenue = (rows ?? []).reduce((s, r) => s + r.revenueCents, 0);
  const totalViews = (rows ?? []).reduce((s, r) => s + r.views, 0);
  const maxViews = Math.max(1, ...(rows ?? []).map((r) => r.views));

  const card =
    'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm';
  const label = 'text-sm font-medium text-gray-500 dark:text-gray-400';

  return (
    <section
      data-testid="insights-panel"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          {t('title')}
        </h1>
        <span
          data-testid="insights-job"
          className="ml-auto font-mono text-xs text-gray-400 dark:text-gray-500"
        >
          {t('job')}: {jobId}
        </span>
      </div>
      <p className="mt-2 max-w-prose text-gray-600 dark:text-gray-400">{t('lead')}</p>

      {/* Page Object: filtry to lokatory + akcje, zero asercji (L02) */}
      <div
        role="group"
        aria-label={t('filters.aria')}
        data-testid="insights-filters"
        className="mt-8 flex flex-wrap items-end gap-4"
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('filters.category')}
          </span>
          <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
            <option>{t('filters.all')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('filters.range')}
          </span>
          <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
            <option>{t('filters.range30')}</option>
            <option>{t('filters.range90')}</option>
          </select>
        </label>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
          {t('filters.apply')}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* i18n-expected: waluta per locale — sygnał, NIE maskować */}
        <div data-testid="insights-total" className={card}>
          <p className={label}>{t('total.label')}</p>
          <p className="mt-2 font-mono text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatPrice(totalRevenue, i18n.language)}
          </p>
        </div>
        <div data-testid="insights-views" className={card}>
          <p className={label}>{t('total.views')}</p>
          <p className="mt-2 font-mono text-3xl font-bold text-gray-900 dark:text-gray-100">
            {totalViews.toLocaleString(i18n.language)}
          </p>
        </div>
        {/* i18n-expected: Intl formatuje datę per locale — dowód, że locale steruje Intl */}
        <div data-testid="insights-period" className={card}>
          <p className={label}>{t('period.label')}</p>
          <p className="mt-2 font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('period.range', { from: periodFrom, to: periodTo })}
          </p>
          {/* NIE maskować: zamraża page.clock */}
          <p
            data-testid="insights-generated"
            className="mt-1 text-xs text-gray-400 dark:text-gray-500"
          >
            {t('generated', { time: generatedAt })}
          </p>
        </div>
        {/* intended: tekst zawija się per język i nadal jest czytelny */}
        <div data-testid="insights-summary" className={card}>
          <p className={label}>{t('summary')}</p>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {t('summaryText', { count: rows?.length ?? 0 })}
          </p>
        </div>
      </div>

      {/*
        threshold (B01): gradient + antyaliasing krawędzi słupków dają naturalny
        szum subpikselowy. To kandydat na maxDiffPixels, nie na globalny threshold.
      */}
      <div className={`mt-6 ${card}`}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t('chart.heading')}
        </h2>
        <svg
          data-testid="insights-chart"
          role="img"
          aria-label={t('chart.aria')}
          viewBox="0 0 600 160"
          className="w-full"
        >
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          {(rows ?? []).map((r, i) => {
            const h = Math.round((r.views / maxViews) * 120);
            return (
              <rect
                key={r.id}
                x={i * 100 + 22}
                y={140 - h}
                width="56"
                height={h}
                rx="6"
                fill="url(#barGrad)"
              />
            );
          })}
        </svg>
      </div>

      {/* mock + factory (L01): wiersze pochodzą z /api/insights, które dryfuje */}
      <div className={`mt-6 ${card}`}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t('table.heading')}
        </h2>
        <table data-testid="insights-table" className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left dark:border-gray-700">
              <th className="py-2 font-medium text-gray-500 dark:text-gray-400">{t('table.artwork')}</th>
              <th className="py-2 text-right font-medium text-gray-500 dark:text-gray-400">{t('table.views')}</th>
              <th className="py-2 text-right font-medium text-gray-500 dark:text-gray-400">{t('table.favorites')}</th>
              <th className="py-2 text-right font-medium text-gray-500 dark:text-gray-400">{t('table.revenue')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {(rows ?? []).map((r) => (
              <tr key={r.id}>
                <td className="py-2 font-medium text-gray-900 dark:text-gray-100">{r.title}</td>
                <td className="py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                  {r.views.toLocaleString(i18n.language)}
                </td>
                <td className="py-2 text-right font-mono text-gray-700 dark:text-gray-300">{r.favorites}</td>
                <td className="py-2 text-right font-mono text-brand-green">
                  {formatPrice(r.revenueCents, i18n.language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
