# AI Testers: Visual Regression Testing z Playwright

Repozytorium z kodem kursu: aplikacja testowa Pixelarium, testy wizualne wszystkich sesji,
prompty AI oraz konfiguracja Visual Regression Trackera. Opisy lekcji, agendy i prezentacje
znajdziesz na platformie kursu, tutaj jest wyłącznie to, co uruchamiasz.

## Wymagania

- Node.js 20 lub nowszy
- Docker Desktop albo Docker Engine 24+ z Compose v2: na Dzień 4 do Visual Regression Trackera,
  na Dzień 5 do ReportPortala (temu drugiemu przydziel co najmniej 6 GB RAM)

## Instalacja

```bash
git clone https://github.com/AI-Testers-pl/ait2vrt1-visualregresiontesting
cd ait2vrt1-visualregresiontesting

npm install                # Playwright Test
npx playwright install     # przeglądarki
npm --prefix app install   # aplikacja Pixelarium
```

## Uruchomienie testów

Aplikacja podnosi się automatycznie razem z testami (sekcja `webServer` w `playwright.config.ts`),
więc wystarczy:

```bash
npm run test:vrt           # wszystkie testy wizualne
npm run test:vrt:update    # regeneracja baseline'ów
npm run test:vrt:report    # raport HTML
```

Baseline'y (`tests/__screenshots__/`) są w `.gitignore`, generujesz je u siebie przy pierwszym
uruchomieniu. Konfiguracja ma trzy projekty: `desktop-light`, `mobile-light` i `desktop-dark`.

Samą aplikację odpalisz osobno, bez testów:

```bash
npm run dev                # http://localhost:5173
```

## Struktura

```
app/                       aplikacja Pixelarium (React + Vite), obiekt testów
tests/
  fixtures/                factory z deterministycznymi danymi, mock handlers
  pages/                   Page Objecty
  visual/s01..s03/         specki wizualne per sesja
  visual/ai/               prompty wczytywane przez testy demonstracyjne
  visual/homework/         miejsce na Twoje rozwiązania
vrt-tracker/               Visual Regression Tracker (S04L01): compose, config agenta, specka
reportportal/              ReportPortal (Dzień 5): compose, config agenta, specki, skrypty z danymi
S01/ ... S05/              per lekcja: PROMPT.md oraz kod ćwiczeń i rozwiązań
.claude/skills/            skille VRT budowane w S03L03
CLAUDE.md                  pamięć agenta: twarde reguły VRT
PLAYWRIGHT_GUIDELINES.md   pełne konwencje: nazewnictwo, baseline'y, progi, maskowanie
```

Aplikacja i konfiguracja są wspólne dla całego kursu. Testy poszczególnych sesji leżą obok
siebie w `tests/visual/` i nie kolidują ze sobą, a nazwa pliku wskazuje lekcję, na przykład
`tests/visual/s01/s01-l02-basics.visual.spec.ts`. Katalogi `S01/` do `S05/` zawierają prompty
AI z lekcji oraz kod zadań domowych i modelowych rozwiązań.

## Visual Regression Tracker (Dzień 4)

Wszystko, co dotyczy trackera, leży w `vrt-tracker/`: własny compose, własny config Playwrighta
i specka `s04-l01.tracker.spec.ts`.

```bash
npm run tracker:up         # dashboard localhost:8080, API localhost:4200, Swagger pod /api
npm run test:vrt:tracker   # specki *.tracker.spec.ts, tylko ten config
npm run tracker:down       # z flagą -v (tracker:reset) czyści bazę i baseline'y
```

Domyślne dane logowania to `admin@vrt.com` / `123456`, zmień je po pierwszym wejściu.
Skopiuj `vrt-tracker/vrt.example.json` do `vrt-tracker/vrt.json` (kopia jest w `.gitignore`)
i wklej klucz API z ustawień projektu w dashboardzie. Agent trackera jest już w `devDependencies`.

Specki trackera celowo mają rozszerzenie `.tracker.spec.ts` i leżą **poza** `tests/`, bo główny
config ma `testDir: './tests'`. Dzięki temu zwykłe `npm run test:vrt` nigdy ich nie podniesie
i nie zrobi czerwonego biegu komuś bez Dockera. Baseline'y tych testów żyją w bazie trackera,
nie w repo.

## ReportPortal (Dzień 5)

Drugi wzorzec integracji, tym razem warstwa raportowania z uczeniem maszynowym. Komplet leży
w `reportportal/`.

```bash
npm run rp:pull            # pobranie obrazów, dłuższy krok, zrób go przed zajęciami
npm run rp:up              # panel localhost:8080, z warstwą analityczną (profil ml)
npm run rp:up:lite         # to samo bez warstwy ML, lżejsze dla słabszej maszyny
npm run test:vrt:rp        # specki *.rp.spec.ts wysyłane do panelu
npm run rp:down            # rp:reset dodatkowo kasuje wolumeny
```

Skopiuj `reportportal/.env.example` do `reportportal/.env` i uzupełnij klucz API z panelu
(obie kopie są w `.gitignore`). Bez konfiguracji specki nadal przechodzą, tylko lokalnie,
z reporterem `list`, więc brak Dockera nie blokuje reszty kursu.

Dwa skrypty przygotowują instancję: `npm run rp:seed` wypełnia historię, na której uczy się
model Auto-Analysis, a `npm run rp:seed:demo` dokłada materiał pokazowy pod filtry, atrybuty
i widgety dashboardu.

Praca domowa Dnia 5 ma osobny skrót: `npm run test:vrt:hw` uruchamia samą speckę
`s05-l04-homework.rp.spec.ts`.

## Skille VRT

W `.claude/skills/` leżą cztery skille zbudowane w S03L03, gotowe do użycia w Claude Code:

- `vrt-spec`: pisze jeden deterministyczny `*.visual.spec.ts`
- `vrt-pom`: pisze jedną klasę Page Object
- `vrt-factory`: generuje deterministyczne dane testowe
- `vrt-i18n`: dokłada oś językowa en/pl/de do istniejącej specki

## Konwencje

Twarde reguły VRT (zegar przed `goto`, maska zamiast `display: none`, priorytet locatorów,
baseline w osobnym commicie) opisuje `CLAUDE.md`, który agent wczytuje automatycznie.
Pełne konwencje zespołowe: `PLAYWRIGHT_GUIDELINES.md`.
