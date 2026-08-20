/**
 * Zasiewa instancję ReportPortala danymi, na których widać sens narzędzia.
 *
 * Po co: Auto-Analysis nie działa na świeżej instalacji. Model potrzebuje ręcznie oznaczonych
 * przykładów, a progi to 100 albo 300 elementów zależnie od wariantu. Na zajęciach nikt nie
 * oznaczy tylu przypadków na żywo, więc historię trzeba przygotować wcześniej.
 *
 * Co robi: tworzy serię przebiegów z realistycznymi logami błędów i od razu przypisuje im typy
 * defektu, czyli dokładnie to, co robiłby człowiek w panelu. Logi muszą mieć prawdziwą treść,
 * bo warstwa analizy szuka podobieństw w indeksie logów, a nie w nazwach testów.
 *
 * Uruchomienie: npm run rp:seed
 * Wyczyszczenie: npm run rp:reset (kasuje wolumeny, czyli całą historię)
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ENV_FILE = fileURLToPath(new URL('.env', import.meta.url));
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const ENDPOINT = process.env.RP_ENDPOINT ?? 'http://localhost:8080/api/v2';
const PROJECT = process.env.RP_PROJECT;
const API_KEY = process.env.RP_APIKEY;

if (!PROJECT || !API_KEY) {
  console.error('[seed] Brak RP_PROJECT albo RP_APIKEY. Skopiuj reportportal/.env.example do .env.');
  process.exit(1);
}

// Reporting idzie na /api/v2, ale ustawianie typu defektu na /api/v1.
const BASE = ENDPOINT.replace(/\/api\/v\d$/, '');
const V1 = `${BASE}/api/v1/${PROJECT}`;
const V2 = `${BASE}/api/v2/${PROJECT}`;

const LAUNCHES = Number(process.env.RP_SEED_LAUNCHES ?? 12);
const PER_LAUNCH = Number(process.env.RP_SEED_ITEMS ?? 30);

/**
 * Cztery powtarzalne awarie, każda z własnym typem defektu i własnym kształtem logu.
 * Powtarzalność jest tu celowa: model uczy się rozpoznawać wzorzec, więc ten sam rodzaj
 * błędu musi wracać z podobną treścią, tak jak w prawdziwym projekcie.
 */
const WZORCE = [
  {
    typ: 'ab001', // Automation Bug
    waga: 4,
    nazwa: (i) => `Gallery: karta dzieła ${i} zgodna z baseline`,
    log: (i) =>
      `Error: expect(page).toHaveScreenshot(expected) failed\n\n` +
      `  ${1800 + i * 7} pixels (ratio 0.01 of all image pixels) are different.\n\n` +
      `  Snapshot: gallery-card-${i}.png\n` +
      `  Call log:\n    - expect "toHaveScreenshot(gallery-card-${i}.png)" with timeout 5000ms`,
    komentarz: 'Świadoma zmiana wyglądu kart, baseline nieaktualny.',
  },
  {
    typ: 'pb001', // Product Bug
    waga: 3,
    nazwa: (i) => `Checkout: podsumowanie koszyka ${i}`,
    log: (i) =>
      `Error: expect(locator).toHaveText(expected) failed\n\n` +
      `  Locator: getByTestId('cart-total')\n` +
      `  Expected string: "1 240,00 zł"\n` +
      `  Received string: "1240 zł"\n` +
      `  Timeout: 5000ms\n  Call log:\n    - waiting for getByTestId('cart-total')`,
    komentarz: 'Format kwoty rozjechał się po zmianie w API, to błąd produktu.',
  },
  {
    typ: 'si001', // System Issue
    waga: 2,
    nazwa: (i) => `Live: tablica ofert ${i}`,
    log: () =>
      `Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/live\n` +
      `  Call log:\n    - navigating to "http://localhost:5173/live", waiting until "load"`,
    komentarz: 'Aplikacja nie wstała w tym biegu, awaria środowiska, nie testu.',
  },
  {
    typ: 'nd001', // No Defect
    waga: 2,
    nazwa: (i) => `Homepage: nagłówek ${i}`,
    log: (i) =>
      `Error: expect(page).toHaveScreenshot(expected) failed\n\n` +
      `  ${9 + (i % 4)} pixels (ratio 0.00 of all image pixels) are different.\n\n` +
      `  Snapshot: homepage-header-${i}.png`,
    komentarz: 'Różnica na kilka pikseli, wynik wygładzania czcionek. Nie usterka.',
  },
];

const PULA = WZORCE.flatMap((w) => Array(w.waga).fill(w));

async function api(url, opcje = {}) {
  const res = await fetch(url, {
    ...opcje,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...(opcje.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`${opcje.method ?? 'GET'} ${url} → ${res.status} ${await res.text()}`);
  }
  return res.json();
}

const czas = (offsetMs) => new Date(Date.now() - offsetMs).toISOString();

async function zasiejPrzebieg(numer) {
  // Przebiegi cofnięte w czasie, żeby historia w panelu miała sensowny rozkład.
  const start = (LAUNCHES - numer) * 3_600_000;

  const launch = await api(`${V2}/launch`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'AiTesters VRT',
      startTime: czas(start),
      mode: 'DEFAULT',
      description: 'Przebieg historyczny, dane do nauki klasyfikatora',
      attributes: [
        { key: 'suite', value: 'visual' },
        { key: 'branch', value: numer % 4 === 0 ? 'main' : 's05' },
        { key: 'viewport', value: numer % 2 ? '1920x1080' : '390x844' },
        { key: 'colorScheme', value: numer % 3 === 0 ? 'dark' : 'light' },
      ],
    }),
  });

  let oznaczone = 0;
  for (let i = 0; i < PER_LAUNCH; i++) {
    const wzorzec = PULA[(numer * PER_LAUNCH + i) % PULA.length];
    const item = await api(`${V2}/item`, {
      method: 'POST',
      body: JSON.stringify({
        name: wzorzec.nazwa(i),
        startTime: czas(start - i * 1000),
        type: 'STEP',
        launchUuid: launch.id,
        attributes: [{ key: 'suite', value: 'visual' }],
      }),
    });

    await api(`${V2}/log`, {
      method: 'POST',
      body: JSON.stringify({
        itemUuid: item.id,
        launchUuid: launch.id,
        level: 'ERROR',
        message: wzorzec.log(i),
        time: czas(start - i * 1000 - 200),
      }),
    });

    await api(`${V2}/item/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        launchUuid: launch.id,
        endTime: czas(start - i * 1000 - 400),
        status: 'FAILED',
        issue: { issueType: wzorzec.typ, comment: wzorzec.komentarz, autoAnalyzed: false },
      }),
    });
    oznaczone++;
  }

  await api(`${V2}/launch/${launch.id}/finish`, {
    method: 'PUT',
    body: JSON.stringify({ endTime: czas(start - PER_LAUNCH * 1000 - 1000) }),
  });

  return oznaczone;
}

console.info(`[seed] ${LAUNCHES} przebiegów po ${PER_LAUNCH} testów do projektu ${PROJECT}`);
let razem = 0;
for (let n = 0; n < LAUNCHES; n++) {
  razem += await zasiejPrzebieg(n);
  process.stdout.write(`\r[seed] oznaczonych elementów: ${razem}`);
}
console.info(`\n[seed] gotowe. ${razem} oznaczonych elementów w historii projektu.`);
console.info('[seed] Indeksowanie przez warstwę analizy zajmuje chwilę po zamknięciu przebiegu.');
