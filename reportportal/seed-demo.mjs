/**
 * Zasiewa ReportPortala materiałem pokazowym: tym, co prowadzący klika przy rzutniku.
 *
 * Po co osobno od seed.mjs: tamten skrypt dowozi LICZBĘ ręcznie oznaczonych elementów,
 * żeby Auto-Analysis miało z czego się uczyć, i jego liczby są opisane w trzech miejscach
 * w kursie. Ten dowozi WYGLĄD: drzewo suite i test, statusy inne niż sama porażka,
 * atrybuty na dwóch poziomach, kilka poziomów logu i załączniki, czyli zrzuty
 * expected, actual i diff przy awarii wizualnej.
 *
 * Pełne przygotowanie instancji przed zajęciami to dwa polecenia:
 *   npm run rp:seed        historia do nauki modelu, próg to 300 oznaczonych elementów
 *   npm run rp:seed:demo   materiał do oglądania w panelu
 *
 * Wyczyszczenie: npm run rp:reset (kasuje wolumeny, czyli całą historię i załączniki).
 *
 * Powielenie wobec seed.mjs (wczytanie konfiguracji, pomocnik api, cztery wzorce awarii)
 * jest świadome. Wyciągnięcie wspólnego modułu wymagałoby ruszenia seed.mjs, a ten plik
 * jest materiałem kursowym: linkują go dwa README i wspomina o nim slajd. Zero zysku
 * dla czytelnika, realne ryzyko rozjechania opisanych liczb.
 *
 * Zero zależności npm. Node 20.12 albo nowszy: potrzebne process.loadEnvFile i globalny fetch.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { screenshotTriplet } from './demo-screenshots.mjs';

const ENV_FILE = fileURLToPath(new URL('.env', import.meta.url));
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const ENDPOINT = process.env.RP_ENDPOINT ?? 'http://localhost:8080/api/v2';
const PROJECT = process.env.RP_PROJECT;
const API_KEY = process.env.RP_APIKEY;

if (!PROJECT || !API_KEY) {
  console.error('[demo] Brak RP_PROJECT albo RP_APIKEY. Skopiuj reportportal/.env.example do .env.');
  process.exit(1);
}

const BASE = ENDPOINT.replace(/\/api\/v\d$/, '');
const V1 = `${BASE}/api/v1/${PROJECT}`;
const V2 = `${BASE}/api/v2/${PROJECT}`;

const LAUNCHES = Number(process.env.RP_DEMO_LAUNCHES ?? 18);
const DAYS = Number(process.env.RP_DEMO_DAYS ?? 14);
const WITH_ATTACHMENTS = process.env.RP_DEMO_ATTACH !== '0';
const LAUNCH_NAME = process.env.RP_DEMO_LAUNCH ?? 'AiTesters VRT';

// ---------------------------------------------------------------------------
// Warstwa HTTP
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Ponawianie przy chwilowych błędach: instancja na laptopie potrafi zwrócić 503 w trakcie GC. */
async function retry(fn, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (error) {
      const transient = /→ (429|502|503|504)|ECONNRESET|fetch failed/.test(String(error.message));
      if (!transient || i >= attempts) throw error;
      await sleep(250 * 4 ** (i - 1));
    }
  }
}

async function api(url, options = {}) {
  return retry(async () => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        ...(options.headers ?? {}),
      },
    });
    if (!res.ok) {
      throw new Error(`${options.method ?? 'GET'} ${url} → ${res.status} ${await res.text()}`);
    }
    return res.json();
  });
}

const BOUNDARY = 'rpseedb0a17c3d92f4';

/**
 * Ciało multipart składamy ręcznie, bajt w bajt jak klient ReportPortala
 * (buildMultiPartStream w @reportportal/client-javascript).
 *
 * Nie używamy natywnego FormData z Node 24, mimo że jest: dla wartości typu Blob bez
 * nazwy specyfikacja każe wstawić filename="blob", a część json_request_part ma być
 * bez nazwy pliku. Ręczne złożenie jest krótsze niż debugowanie tej różnicy.
 *
 * Jedno celowe odstępstwo od klienta: on wstawia trzy CRLF-y po nagłówku Content-Type
 * części JSON, przez co ciało zaczyna się od pustej linii. Jackson to pomija, więc
 * działa, ale RFC 7578 mówi o dwóch i tak tu robimy.
 */
function multipartBody(logs, files) {
  const eol = '\r\n';
  const bx = `--${BOUNDARY}`;
  const parts = [
    Buffer.from(
      bx + eol +
      'Content-Disposition: form-data; name="json_request_part"' + eol +
      'Content-Type: application/json' + eol + eol +
      JSON.stringify(logs) + eol,
    ),
  ];
  for (const file of files) {
    parts.push(
      Buffer.from(
        bx + eol +
        `Content-Disposition: form-data; name="file"; filename="${file.name}"` + eol +
        `Content-Type: ${file.type}` + eol + eol,
      ),
      file.data,
      Buffer.from(eol),
    );
  }
  parts.push(Buffer.from(`${bx}--${eol}`));
  return Buffer.concat(parts);
}

/**
 * Paczka logów z załącznikami w jednym żądaniu. Wiązanie idzie po nazwie: pole file.name
 * w obiekcie logu musi się zgadzać z filename części binarnej, a nazwy muszą być unikalne
 * w obrębie jednego żądania.
 */
async function sendLogBatch(logs, files) {
  return retry(async () => {
    const res = await fetch(`${V2}/log`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${BOUNDARY}`,
      },
      body: multipartBody(logs, files),
    });
    if (!res.ok) throw new Error(`POST ${V2}/log (multipart) → ${res.status} ${await res.text()}`);
    return res.json();
  });
}

/** Pojedynczy log bez załącznika: tu ciałem jest obiekt, nie tablica. Ta różnica jest realna. */
const sendLog = (log) => api(`${V2}/log`, { method: 'POST', body: JSON.stringify(log) });

// ---------------------------------------------------------------------------
// Model danych
// ---------------------------------------------------------------------------

/**
 * Trzy projekty Playwrighta z reportportal/playwright.config.ts i ich atrybuty
 * z reportportal/rp.attributes.ts.
 *
 * To kopia, nie import: z pliku .mjs nie da się wczytać modułu TypeScriptu, bo w repo
 * nie ma tsx ani typescriptu w katalogu głównym. Przy zmianie konwencji popraw oba pliki.
 */
const PROJECTS = [
  {
    name: 'rp-desktop-light',
    theme: 'light',
    attributes: [
      { key: 'viewport', value: '1920x1080' },
      { key: 'colorScheme', value: 'light' },
      { key: 'device', value: 'desktop' },
    ],
  },
  {
    name: 'rp-mobile-light',
    theme: 'light',
    attributes: [
      { key: 'viewport', value: '390x844' },
      { key: 'colorScheme', value: 'light' },
      { key: 'device', value: 'mobile' },
    ],
  },
  {
    name: 'rp-desktop-dark',
    theme: 'dark',
    attributes: [
      { key: 'viewport', value: '1920x1080' },
      { key: 'colorScheme', value: 'dark' },
      { key: 'device', value: 'desktop' },
    ],
  },
];

/**
 * Cztery powtarzalne awarie. Treść logu celowo pokrywa się z seed.mjs: warstwa analizy
 * szuka podobieństw w TREŚCI logu, więc oba skrypty mają zasilać te same klastry,
 * a nie budować dwa osobne światy.
 */
const FAILURES = {
  ab001: {
    type: 'ab001',
    visual: true,
    comment: 'Świadoma zmiana wyglądu kart, baseline nieaktualny.',
    message: (slug, changed) =>
      `Error: expect(page).toHaveScreenshot(expected) failed\n\n` +
      `  ${changed} pixels (ratio 0.16 of all image pixels) are different.\n\n` +
      `  Snapshot: ${slug}.png\n` +
      `  Call log:\n    - expect "toHaveScreenshot(${slug}.png)" with timeout 5000ms`,
  },
  pb001: {
    type: 'pb001',
    visual: false,
    comment: 'Format kwoty rozjechał się po zmianie w API, to błąd produktu.',
    message: () =>
      `Error: expect(locator).toHaveText(expected) failed\n\n` +
      `  Locator: getByTestId('cart-total')\n` +
      `  Expected string: "1 240,00 zł"\n` +
      `  Received string: "1240 zł"\n` +
      `  Timeout: 5000ms\n  Call log:\n    - waiting for getByTestId('cart-total')`,
  },
  si001: {
    type: 'si001',
    visual: false,
    comment: 'Aplikacja nie wstała w tym biegu, awaria środowiska, nie testu.',
    message: () =>
      `Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/live\n` +
      `  Call log:\n    - navigating to "http://localhost:5173/live", waiting until "load"`,
  },
  nd001: {
    type: 'nd001',
    visual: true,
    comment: 'Różnica na kilka pikseli, wynik wygładzania czcionek. Nie usterka.',
    message: (slug) =>
      `Error: expect(page).toHaveScreenshot(expected) failed\n\n` +
      `  11 pixels (ratio 0.00 of all image pixels) are different.\n\n` +
      `  Snapshot: ${slug}.png`,
  },
};

/**
 * Drzewo przebiegu: trzy pliki specek, w każdym dwa describe po cztery przypadki.
 * Katalog jest STAŁY, ten sam w każdym przebiegu, i to jest różnica wobec seed.mjs,
 * gdzie nazwa elementu zależała od numeru przebiegu. Przy stałych nazwach historia
 * pojedynczego testu w panelu pokazuje osiemnaście biegów, a nie osiemnaście osobnych testów.
 */
const TREE = [
  {
    file: 's05-gallery.visual.spec.ts',
    groups: [
      { name: 'Siatka galerii', tests: ['siatka na starcie', 'siatka po filtrze', 'siatka pusta', 'siatka z paginacją'] },
      { name: 'Karta dzieła', tests: ['karta domyślna', 'karta z odznaką', 'karta wyprzedana', 'karta ze skróconym opisem'] },
    ],
  },
  {
    file: 's05-checkout.visual.spec.ts',
    groups: [
      { name: 'Podsumowanie koszyka', tests: ['koszyk z jedną pozycją', 'koszyk z rabatem', 'koszyk pusty', 'koszyk po usunięciu pozycji'] },
      { name: 'Płatność', tests: ['formularz płatności', 'błąd walidacji', 'potwierdzenie', 'przycisk zablokowany'] },
    ],
  },
  {
    file: 's05-home.visual.spec.ts',
    groups: [
      { name: 'Nagłówek', tests: ['nagłówek na starcie', 'nagłówek po przewinięciu', 'menu mobilne', 'przełącznik języka'] },
      { name: 'Sekcja hero', tests: ['hero z licznikiem', 'hero bez licznika', 'hero w ciemnym motywie', 'stopka'] },
    ],
  },
];

/**
 * Wynik przypadku liczony z indeksów, bez losowania: dwa biegi skryptu mają dać ten sam
 * obraz, bo przy demonstracji nie chcemy loterii. Wychodzi około 60% PASSED, 33% FAILED
 * i 7% SKIPPED, więc panel przestaje pokazywać Passed 0.00%.
 */
function caseStatus(launchNo, caseNo) {
  const k = (launchNo * 7 + caseNo * 3) % 15;
  if (k === 4) return 'SKIPPED';
  if (k < 5) return 'FAILED';
  return 'PASSED';
}

/**
 * Wzorzec awarii bierzemy z licznika awarii, a nie z indeksu przypadku. Przy liczeniu
 * z indeksu obie formuły okazały się skorelowane i wszystkie awarie wypadały wizualne,
 * czyli w panelu nie było ani jednego Product Bug. Licznik daje równy rozkład niezależnie
 * od tego, które przypadki akurat padły.
 */
const FAILURE_CYCLE = ['ab001', 'ab001', 'pb001', 'si001', 'nd001'];

/**
 * Dwa najświeższe przebiegi zostają bez etykiet. Bez elementów w To Investigate nie ma
 * czego pokazać w oknie Make decision ani na czym uruchomić Auto-Analysis, a ich logi
 * celowo pasują do klastra, który reszta historii oznaczyła jako Automation Bug.
 * Przy bardzo małym RP_DEMO_LAUNCHES zostawiamy przynajmniej jeden przebieg oznaczony,
 * żeby szybki bieg kontrolny też coś pokazywał.
 */
const isLabelled = (launchNo) => launchNo < Math.max(1, LAUNCHES - 2);

const iso = (ms) => new Date(ms).toISOString();

// Nazwy plików trafiają do nagłówka multipart, więc znaki diakrytyczne z nich zdejmujemy.
// Ł i ł trzeba podmienić osobno: NFD ich nie rozkłada, bo to samodzielne litery,
// a nie litery bazowe ze znakiem diakrytycznym.
const slugify = (text) =>
  text
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

// ---------------------------------------------------------------------------
// Zasiewanie
// ---------------------------------------------------------------------------

async function seedLaunch(launchNo, counters) {
  const project = PROJECTS[launchNo % PROJECTS.length];
  const spacing = (DAYS * 86_400_000) / LAUNCHES;
  let clock = Date.now() - (LAUNCHES - launchNo) * spacing;

  const launch = await api(`${V2}/launch`, {
    method: 'POST',
    body: JSON.stringify({
      name: LAUNCH_NAME,
      startTime: iso(clock),
      mode: 'DEFAULT',
      description: `Testy wizualne Pixelarium, projekt ${project.name}. Dane demonstracyjne z seed-demo.mjs.`,
      attributes: [
        { key: 'suite', value: 'visual' },
        { key: 'branch', value: launchNo % 4 === 0 ? 'main' : 's05' },
        // Znacznik pochodzenia: na zajęciach ma być jasne, że to dane wygenerowane,
        // a nie zapis prawdziwego biegu Playwrighta.
        { key: 'dataset', value: 'seed' },
        ...project.attributes,
      ],
    }),
  });

  let caseNo = 0;

  for (const spec of TREE) {
    const suite = await api(`${V2}/item`, {
      method: 'POST',
      body: JSON.stringify({
        name: spec.file,
        startTime: iso(clock),
        type: 'SUITE',
        launchUuid: launch.id,
        codeRef: `reportportal/${spec.file}`,
        attributes: [{ key: 'suite', value: 'visual' }],
      }),
    });

    for (const group of spec.groups) {
      const test = await api(`${V2}/item/${suite.id}`, {
        method: 'POST',
        body: JSON.stringify({
          name: group.name,
          startTime: iso(clock),
          type: 'TEST',
          launchUuid: launch.id,
          codeRef: `reportportal/${spec.file}#${group.name}`,
        }),
      });

      let groupFailed = false;

      for (const testName of group.tests) {
        const startedAt = clock;
        const status = caseStatus(launchNo, caseNo);
        caseNo++;
        const failure =
          status === 'FAILED' ? FAILURES[FAILURE_CYCLE[counters.failures++ % FAILURE_CYCLE.length]] : null;
        const slug = slugify(testName);

        const step = await api(`${V2}/item/${test.id}`, {
          method: 'POST',
          body: JSON.stringify({
            name: testName,
            startTime: iso(startedAt),
            type: 'STEP',
            launchUuid: launch.id,
            // codeRef identyczny co do znaku w każdym przebiegu, inaczej historia
            // pojedynczego testu w panelu rozsypuje się na osobne wpisy.
            codeRef: `reportportal/${spec.file}#${group.name}#${testName}`,
            attributes: [...project.attributes, { key: 'suite', value: 'visual' }],
          }),
        });

        const common = { itemUuid: step.id, launchUuid: launch.id };

        if (status === 'SKIPPED') {
          await sendLog({ ...common, level: 'WARN', message: `Test pominięty: brak baseline dla projektu ${project.name}.`, time: iso(startedAt + 120) });
        } else if (status === 'PASSED') {
          await sendLog({ ...common, level: 'INFO', message: `page.goto('http://localhost:5173') · projekt ${project.name}`, time: iso(startedAt + 120) });
          await sendLog({ ...common, level: 'DEBUG', message: 'page.clock.setFixedTime przed goto, zegar zamrożony, mock API aktywny', time: iso(startedAt + 240) });
          await sendLog({ ...common, level: 'INFO', message: 'Zrzut zgodny z baseline, 0 pikseli różnicy.', time: iso(startedAt + 900) });
        } else {
          groupFailed = true;
          let changed = 1842;
          const files = [];
          const logs = [
            { ...common, level: 'INFO', message: `page.goto('http://localhost:5173') · projekt ${project.name}`, time: iso(startedAt + 120) },
            { ...common, level: 'DEBUG', message: 'page.clock.setFixedTime przed goto, zegar zamrożony, mock API aktywny', time: iso(startedAt + 240) },
            { ...common, level: 'WARN', message: 'Ponowne porównanie po 500 ms, różnica nadal powyżej progu.', time: iso(startedAt + 1_100) },
          ];

          if (failure.visual && WITH_ATTACHMENTS) {
            const triplet = screenshotTriplet(project.theme);
            changed = triplet.changed;
            const captions = {
              'expected.png': 'Zrzut oczekiwany, czyli baseline',
              'actual.png': 'Zrzut z tego biegu',
              'diff.png': 'Różnica, znacznik #FF00FF',
            };
            for (const file of triplet.files) {
              const name = `${slug}-${file.name}`;
              files.push({ ...file, name });
              logs.push({ ...common, level: 'INFO', message: `${captions[file.name]} (obraz wygenerowany, dane demonstracyjne)`, time: iso(startedAt + 1_200), file: { name } });
            }
          }

          // ERROR idzie na końcu tablicy, ale z własnym znacznikiem czasu: tylko logi
          // od poziomu ERROR w górę trafiają do indeksu warstwy analizy.
          logs.push({ ...common, level: 'ERROR', message: failure.message(slug, changed), time: iso(startedAt + 1_300) });

          if (WITH_ATTACHMENTS) {
            const txtName = `${slug}-console.txt`;
            files.push({
              name: txtName,
              type: 'text/plain',
              data: Buffer.from(
                [
                  `[console] projekt ${project.name}`,
                  `[console] viewport ${project.attributes[0].value}, colorScheme ${project.attributes[1].value}`,
                  `[console] mask: [getByTestId('live-counter')] maskColor #FF00FF`,
                  `[console] baseline: __screenshots__/${project.name}/${spec.file}/${slug}.png`,
                ].join('\n'),
                'utf8',
              ),
            });
            logs.push({ ...common, level: 'INFO', message: 'Wyjście konsoli przeglądarki', time: iso(startedAt + 1_400), file: { name: txtName } });
          }

          if (files.length) {
            await sendLogBatch(logs, files);
            counters.files += files.length;
          } else {
            for (const log of logs) await sendLog(log);
          }
        }

        clock = startedAt + 2_400;

        const finish = { launchUuid: launch.id, endTime: iso(startedAt + 2_200), status };
        if (status === 'FAILED' && isLabelled(launchNo)) {
          // autoAnalyzed zawsze false: odznaka AA ma się pojawić tylko wtedy, gdy typ
          // naprawdę nadał model. Podrobienie jej kłamałoby w lekcji akurat o niej.
          finish.issue = { issueType: failure.type, comment: failure.comment, autoAnalyzed: false };
          counters.labelled++;
        }
        await api(`${V2}/item/${step.id}`, { method: 'PUT', body: JSON.stringify(finish) });
        counters[status]++;
        counters.total++;
      }

      await api(`${V2}/item/${test.id}`, {
        method: 'PUT',
        body: JSON.stringify({ launchUuid: launch.id, endTime: iso(clock), status: groupFailed ? 'FAILED' : 'PASSED' }),
      });
    }

    await api(`${V2}/item/${suite.id}`, {
      method: 'PUT',
      body: JSON.stringify({ launchUuid: launch.id, endTime: iso(clock) }),
    });
  }

  await api(`${V2}/launch/${launch.id}/finish`, {
    method: 'PUT',
    body: JSON.stringify({ endTime: iso(clock + 1_000) }),
  });
}

/**
 * Sprawdzenie przed pierwszym zapisem. Bez tego literówka w RP_PROJECT kończy się tak,
 * jak opisuje reportportal/README.md: skrypt przechodzi, a lista przebiegów zostaje pusta.
 */
async function checkAccess() {
  let res;
  try {
    res = await fetch(`${V1}/launch?page.size=1`, { headers: { Authorization: `Bearer ${API_KEY}` } });
  } catch {
    console.error(`[demo] ReportPortal nie odpowiada pod ${ENDPOINT}. Podnieś stack: npm run rp:up`);
    process.exit(1);
  }
  if (res.status === 401) {
    console.error('[demo] Klucz API odrzucony. To klucz z profilu użytkownika, nie hasło do panelu.');
    process.exit(1);
  }
  if (res.status === 403 || res.status === 404) {
    console.error(`[demo] Projekt ${PROJECT} nie istnieje albo klucz nie ma do niego dostępu.`);
    console.error('[demo] Nazwa musi zgadzać się co do znaku, z wielkością liter włącznie.');
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`[demo] GET ${V1}/launch → ${res.status}. Sprawdź stan instancji.`);
    process.exit(1);
  }
  const body = await res.json().catch(() => null);
  const existing = body?.page?.totalElements ?? 0;
  if (existing > 0) {
    console.info(`[demo] Uwaga: w projekcie jest już ${existing} przebiegów. Ten skrypt DOPISUJE, nie zastępuje.`);
    console.info('[demo] Czysty start: npm run rp:reset, potem npm run rp:up.');
  }
}

await checkAccess();

console.info(`[demo] projekt ${PROJECT}, endpoint ${ENDPOINT}, klucz ***`);
console.info(`[demo] plan: ${LAUNCHES} przebiegów po 24 testy, ${DAYS} dni wstecz, załączniki: ${WITH_ATTACHMENTS ? 'tak' : 'nie'}`);

// failures: licznik przez cały bieg, żeby wzorce awarii rotowały równo między przebiegami.
const counters = { total: 0, labelled: 0, files: 0, failures: 0, PASSED: 0, FAILED: 0, SKIPPED: 0 };
const startedAt = Date.now();

for (let launchNo = 0; launchNo < LAUNCHES; launchNo++) {
  await seedLaunch(launchNo, counters);
  process.stdout.write(`\r[demo] przebiegi ${launchNo + 1}/${LAUNCHES}, elementy ${counters.total}, załączniki ${counters.files}`);
}

const seconds = Math.round((Date.now() - startedAt) / 1000);
console.info(`\n[demo] gotowe w ${seconds} s.`);
console.info(`[demo] elementy: ${counters.total}, w tym ${counters.PASSED} PASSED, ${counters.SKIPPED} SKIPPED, ${counters.FAILED} FAILED.`);
console.info(`[demo] etykiety defektu nadane ręcznie: ${counters.labelled}, reszta awarii została w To Investigate.`);
console.info(`[demo] załączniki: ${counters.files} plików w wolumenie storage.`);
console.info('[demo] Dwa ostatnie przebiegi są bez etykiet celowo: to materiał na Make decision i Auto-Analysis.');
console.info('[demo] Indeksowanie i Unique Error Analysis ruszają po zamknięciu przebiegu, daj panelowi chwilę.');
