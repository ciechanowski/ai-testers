import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../utils/formatPrice';

/**
 * Creator Payouts — playground zadania domowego S02L04 (oś języka).
 *
 * Fixture dydaktyczny: layout jest poprawny po EN i PL, a rozjeżdża się po DE,
 * bo niemieckie złożenia są ~30-40% dłuższe. Błąd istnieje od pierwszego
 * renderu, więc pixel diff go NIE złapie — wchodzi do baseline'u jako "prawda".
 * Znajduje go dopiero przegląd pierwszego baseline'u.
 */
export function PayoutsPage() {
  const { t, i18n } = useTranslation('payouts');

  // must_mask — losowy identyfikator, inny przy każdym mount
  const [ref] = useState(() => Math.random().toString(16).slice(2, 10).toUpperCase());

  // NIE maskować — czas zamraża page.clock
  const [nextPayoutAt] = useState(() => Date.now() + 5 * 86_400_000);

  const payoutDate = new Date(nextPayoutAt).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const card =
    'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm';
  const label = 'text-sm font-medium text-gray-500 dark:text-gray-400';

  return (
    <section
      data-testid="payouts-panel"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/*
        should_review (DE, tylko mobile): truncate na tytule "żeby zmieścił się
        w jednej linii obok Ref". EN "Payout settings" (~220px) mieści się na 390px.
        DE "Auszahlungseinstellungen" (~382px) zostaje UCIĘTE do "Auszahlungseinstellun…".
        Na desktopie (1920px) miejsca jest dość, więc bug NIE występuje — widać go
        dopiero na wąskim viewporcie. Ucięty tytuł: da się odczytać z kontekstu czy nie?
        Student decyduje. Usunięcie flex-wrap trzyma tytuł i Ref w jednym rzędzie.
      */}
      <div className="flex items-center gap-3">
        <h1
          data-testid="payouts-title"
          className="min-w-0 truncate text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100"
        >
          {t('title')}
        </h1>
        <span
          data-testid="payouts-ref"
          className="ml-auto font-mono text-xs text-gray-400 dark:text-gray-500"
        >
          {t('ref')}: {ref}
        </span>
      </div>
      <p className="mt-2 max-w-prose text-gray-600 dark:text-gray-400">{t('lead')}</p>

      {/*
        must_fix (DE, mobile): whitespace-nowrap bez overflow-x-auto.
        EN "Overview/Methods/History" ~24 znaki mieści się w 390px.
        DE "Übersicht/Zahlungsmethoden/Auszahlungsverlauf" ~46 znaków — nie mieści się.
      */}
      <nav
        aria-label={t('tabs.aria')}
        data-testid="payouts-tabs"
        className="mt-8 flex gap-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700"
      >
        {(['overview', 'methods', 'history'] as const).map((key, i) => (
          <button
            key={key}
            aria-current={i === 0 ? 'page' : undefined}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              i === 0
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
      </nav>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/*
          i18n-expected: waluta i format liczby różnią się per locale — to NIE regresja.
          content-bug (DE): balance.pending został nieprzetłumaczony — w de/payouts.json
          zostało angielskie "Pending clearance" (tłumacz pominął klucz). Layout OK,
          długość podobna, więc pixel diff jest zielony. Podstęp: przy porównaniu de↔en
          ten string wygląda IDENTYCZNIE jak EN, więc łatwo go zaklasyfikować jako "OK".
          Łapie go wyłącznie ktoś, kto CZYTA po niemiecku — nie żaden zrzut ekranu.
        */}
        <div data-testid="payouts-balance" className={card}>
          <p className={label}>{t('balance.label')}</p>
          <p className="mt-2 font-mono text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatPrice(482_350, i18n.language)}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('balance.pending')}</p>
        </div>

        {/* NIE maskować: data zamrożona przez page.clock */}
        <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 shadow-lg lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">
            {t('next.label')}
          </p>
          <p
            data-testid="payouts-next-date"
            className="mt-2 font-mono text-3xl font-bold text-white"
          >
            {t('next.on', { date: payoutDate })}
          </p>
        </div>
      </div>

      <div className={`mt-6 ${card}`}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t('recipient.heading')}
        </h2>

        <dl className="space-y-3 text-sm">
          <div
            data-testid="payouts-taxid"
            className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-3"
          >
            <dt className="font-medium text-gray-500 dark:text-gray-400">{t('recipient.taxId')}</dt>
            <dd className="font-mono text-gray-900 dark:text-gray-100">DE812305078</dd>
          </div>
          {/*
            should_review (DE, mobile): flex bez min-w-0 → etykieta ma min-width:auto,
            więc się nie zwęża i to WARTOŚĆ zostaje ucięta przez truncate.
            Długa etykieta (DE "Internationale Bankkontonummer") + długi IBAN nie mieszczą
            się razem na 390px. Ucięty IBAN to nie to samo co ucięty przycisk — dane wciąż
            są nieczytelne, ale czy to bug, czy akceptowalny kompromis? Student decyduje.
          */}
          <div
            data-testid="payouts-account"
            className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-3"
          >
            <dt className="font-medium text-gray-500 dark:text-gray-400">{t('recipient.account')}</dt>
            <dd className="truncate font-mono text-gray-900 dark:text-gray-100">
              DE89 3704 0044 0532 0130 00
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-medium text-gray-500 dark:text-gray-400">{t('recipient.country')}</dt>
            <dd className="text-gray-900 dark:text-gray-100">{t('recipient.countryValue')}</dd>
          </div>
        </dl>

        {/* intended: max-w-prose → dłuższy tekst zawija się i nadal jest czytelny */}
        <p
          data-testid="payouts-note"
          className="mt-5 max-w-prose text-xs leading-relaxed text-gray-500 dark:text-gray-400"
        >
          {t('note')}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/*
            must_fix (DE): szerokość na sztywno (w-44 = 176px) + overflow-hidden.
            EN "Save settings" (~110px) mieści się. DE "Auszahlungseinstellungen speichern"
            (~250px) zostaje UCIĘTE — etykieta jest nieczytelna. To główny błąd zadania.
          */}
          <button
            data-testid="payouts-submit"
            className="w-44 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            {t('actions.save')}
          </button>

          {/*
            ARIA-only: div z onClick i BEZ role — wygląda piksel w piksel jak przycisk,
            więc screenshot tego nie wykryje. W .aria.yml renderuje się jako `- text`,
            nie `- button`. Uwaga: <div role="button"> renderowałby się jako `- button`,
            czyli identycznie jak natywny — dlatego fixture używa wariantu BEZ roli.
          */}
          <div
            data-testid="payouts-export"
            onClick={() => undefined}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {t('actions.export')}
          </div>
        </div>
      </div>
    </section>
  );
}
