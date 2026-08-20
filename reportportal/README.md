# ReportPortal (S05L01)

Warstwa raportowania przebiegów testów, stawiana u siebie. Odpowiada na inne pytanie
niż pozostałe narzędzia kursu:

| Narzędzie | Pytanie, na które odpowiada |
|---|---|
| `tests/visual/` z `toHaveScreenshot()` | czy ten zrzut zgadza się z baseline'em w repo |
| `vrt-tracker/` | czy piksel się zmienił i kto to zatwierdza |
| `reportportal/` | dlaczego ten bieg padł, czy już to znamy i jak wygląda trend |

ReportPortal **nie porównuje obrazków**. Trzyma zrzuty jako załączniki, ale nie powie Ci,
że przycisk przesunął się o trzy piksele. Od tego jest VRT Tracker.

## Wymagania

- Docker 24+ z Compose v2
- **6 GB RAM przydzielone Dockerowi** dla pełnego stacku, 4 GB dla wariantu bez ML
- około 20 GB wolnego miejsca na obrazy i wolumeny
- wolne porty **8080** i **8081**

Panel stoi na 8080, tablica routingu Traefika na 8081. Dlatego VRT Tracker z S04L01
celowo siedzi na 8082, a jego baza na 5432. Baza ReportPortala nie jest publikowana
na hosta właśnie po to, żeby te dwa stacki mogły chodzić naraz.

## Od zera, sześć kroków

```bash
# 1. pobierz obrazy zawczasu, to około 2,7 GB
npm run rp:pull

# 2. podnieś stack i poczekaj, aż healthchecki przejdą
npm run rp:up          # pełny, z warstwą ML
npm run rp:up:lite     # bez OpenSearcha i analizatora, dla słabszej maszyny

# 3. zaloguj się na http://localhost:8080
#    superadmin / erebus, potem wymuszona zmiana hasła

# 4. utwórz projekt, na przykład `aitesters_vrt`, i zapamiętaj jego nazwę
#    (w tym wydaniu API adresuje projekt nazwą, nie kluczem organizacji)

# 5. w menu użytkownika, Profile, wygeneruj API key

# 6. przenieś oba do konfiguracji lokalnej
cp reportportal/.env.example reportportal/.env
#    uzupełnij RP_PROJECT i RP_APIKEY, potem:
npm run test:vrt:rp
```

W PowerShellu krok szósty to `Copy-Item reportportal\.env.example reportportal\.env`.

## Co zobaczysz przy pierwszym biegu

Na liście przebiegów pojawi się launch `AiTesters VRT` z dziewięcioma testami: trzy
przypadki razy trzy projekty Playwrighta. Każdy test ma kroki (`test.step`), atrybuty
`viewport`, `colorScheme` i `device`, a testy wizualne dodatkowo zrzut jako załącznik.

Przy czerwonym wyniku Playwright sam dopina do wyniku trójkę `expected`, `actual` i `diff`,
a agent sam wysyła ją do panelu. **Nie trzeba pisać żadnego `testInfo.attach()`**: ręczne
dopinanie z bloku `try/catch` to zbędna praca i krucha ścieżka do pliku.

Czerwony przebieg do ćwiczeń zrobisz bez psucia kodu:

```bash
RP_DEMO=design npm run test:vrt:rp   # celowa zmiana designu, czyli nieaktualny baseline
RP_DEMO=bug    npm run test:vrt:rp   # realny błąd produktu, znika kontrast nagłówka karty
RP_DEMO=noise  npm run test:vrt:rp   # szum na ułamek piksela
```

Trzy przypadki, trzy różne etykiety defektu w panelu. To materiał do lekcji o warstwie AI:
ten sam czerwony wynik znaczy trzy różne rzeczy, a model uczy się tego, co mu podpiszesz.

## Historia do nauki modelu (S05L02)

Auto-Analysis nie ruszy na świeżej instancji: model, który nadaje typ defektu, potrzebuje
**300 ręcznie oznaczonych elementów**, a podpowiedzi w oknie decyzji 100. Nikt nie oznaczy
tylu przypadków na żywo, więc historię zasiewa się wcześniej, przez API:

```bash
npm run rp:seed
```

[`seed.mjs`](seed.mjs) tworzy domyślnie **12 przebiegów po 30 testów, czyli 360 oznaczonych
elementów**. Idą z nich cztery powtarzalne wzorce awarii, każdy z własnym typem defektu,
treścią logu i komentarzem:

| Wzorzec | Typ | Log |
|---|---|---|
| zmiana designu kart | `ab001` Automation Bug | różnica pikseli w `toHaveScreenshot` |
| format kwoty w koszyku | `pb001` Product Bug | `toHaveText`, `1240 zł` zamiast `1 240,00 zł` |
| aplikacja nie wstała | `si001` System Issue | `net::ERR_CONNECTION_REFUSED` |
| wygładzanie czcionek | `nd001` No Defect | kilka pikseli różnicy |

Powtarzalność jest celowa: warstwa analizy szuka podobieństw w **treści logów**, nie w nazwach
testów. Przebiegi lecą w trybie `DEFAULT`, bo `DEBUG` nie trafia do indeksu i model niczego by
się z nich nie nauczył. Rozmiar zmienisz przez `RP_SEED_LAUNCHES` i `RP_SEED_ITEMS`.

Do 360 elementów z seeda dochodzą przebiegi demo z `RP_DEMO`, stąd 363 oznaczone elementy na
zrzutach w S05L02. Indeksowanie zajmuje chwilę po zamknięciu przebiegu, a całą historię kasuje
`npm run rp:reset`.

## Materiał pokazowy do panelu (S05L02 i S05L03)

`seed.mjs` dowozi **liczbę** oznaczonych elementów, bo tego potrzebuje model. Nie dowozi
**wyglądu**: robi same porażki, płaską listę i jeden log na element, więc panel pokazuje
`Passed 0.00%`, a zakładka z załącznikami świeci pustkami. Do pokazywania panelu na zajęciach
jest drugi skrypt:

```bash
npm run rp:seed:demo
```

[`seed-demo.mjs`](seed-demo.mjs) tworzy domyślnie **18 przebiegów po 24 testy**, rozłożonych
na 14 dni wstecz, i dokłada to, czego brakuje przy rzutniku:

| Co | Po co w panelu |
|---|---|
| statusy PASSED, FAILED i SKIPPED | licznik `Passed` przestaje być zerowy |
| drzewo SUITE, TEST, STEP | wnętrze przebiegu wygląda jak bieg Playwrighta, a nie lista |
| atrybuty na przebiegu i na elemencie | filtry i widgety mają po czym szukać (`suite`, `branch`, `viewport`, `colorScheme`, `device`) |
| logi INFO, DEBUG, WARN i ERROR | zakładka z logami ma czym filtrować po poziomie |
| załączniki `expected`, `actual`, `diff` plus `console.txt` | zakładka z załącznikami pokazuje, jak wygląda awaria wizualna |
| stałe nazwy testów w każdym przebiegu | historia pojedynczego testu pokazuje 18 biegów, a nie 18 osobnych testów |
| dwa ostatnie przebiegi bez etykiet | jest na czym pokazać okno Make decision i Auto-Analysis |

**Zrzuty są generowane, nie pochodzą z Playwrighta.** Skrypt rysuje je sam, bez żadnej
zależności npm, bo katalogi `__screenshots__/` są w `.gitignore` i na świeżym klonie ich nie ma.
Różnicę znaczy kolorem `#FF00FF`, tym samym co `maskColor` w regułach kursu, żeby była czytelna
na rzutniku. Prawdziwe pliki `-diff.png` z Playwrighta znaczą zmianę na czerwono, więc warto to
na zajęciach powiedzieć. Prawdziwe załączniki daje `npm run test:vrt:rp`, ten skrypt daje ilość.
Każdy zasiany przebieg ma atrybut `dataset: seed`, więc widać, skąd pochodzi.

Skala i koszt: około 430 elementów, 1000 logów i 330 plików, czyli kilka megabajtów w wolumenie
`storage`. Pokrętła: `RP_DEMO_LAUNCHES`, `RP_DEMO_DAYS`, `RP_DEMO_ATTACH=0` (bieg bez plików,
dużo szybszy), `RP_DEMO_LAUNCH` (nazwa przebiegu).

Pełne przygotowanie instancji przed zajęciami to **dwa polecenia**: `npm run rp:seed` daje
objętość do nauki modelu, `npm run rp:seed:demo` daje materiał do oglądania. Skrypt **dopisuje**
przebiegi, nie zastępuje ich, więc czysty start to `npm run rp:reset`.

Dwie rzeczy do sprawdzenia w ustawieniach projektu przed zajęciami: retencja zrzutów (usuwa
załączniki starsze niż ustawiony okres, a przebiegi są cofnięte o dwa tygodnie) oraz opcja
traktowania testów pominiętych jako defekt, bo przy niej elementy SKIPPED wpadają do
`To Investigate` i mieszają się z materiałem na Auto-Analysis.

## Praca domowa (S05L04)

Osobna specka [`s05-l04-homework.rp.spec.ts`](s05-l04-homework.rp.spec.ts) i osobne polecenie:

```bash
npm run test:vrt:hw -- --update-snapshots   # bieg czysty, nagrywa baseline'y
npm run test:vrt:hw                         # bieg z regresją, po ustawieniu HW_SEED
```

Trzy strony razy trzy projekty dają dziewięć wyników w jednym przebiegu. Każdy dostaje
atrybuty `viewport`, `colorScheme` i `device` z `rp.attributes.ts`, a do tego `page`,
dołożony tylko na potrzeby zadania. Dzięki niemu widget odróżnia „sypie się jedna strona"
od „sypie się jedno środowisko".

Regresję wybiera ziarno `HW_SEED` z `.env`, czyli imię osoby rozwiązującej. Wariant jest
stały przez cały przebieg, więc czerwone wyniki układają się we wzór czytelny w widgecie
**Component health check**. Puste ziarno oznacza bieg czysty.

W odróżnieniu od `s05-l01-regression.rp.spec.ts` regresja **nie wchodzi parametrem `?vrt=`**.
Adres strony trafia do panelu jako nazwa kroku, więc `?vrt=card-design` byłoby gotową
odpowiedzią i dla osoby rozwiązującej, i dla agenta pytanego przez MCP. Zamiast tego test
dokłada arkusz stylów, a panel dostaje to samo, co przy prawdziwej regresji: wyniki,
atrybuty i zrzuty.

Warianty i klucz odpowiedzi siedzą w [`hw.regression.ts`](hw.regression.ts), na dole pliku.
Osobie rozwiązującej ten plik jest niepotrzebny do uruchomienia zadania.

## Skąd bierze się konfiguracja

Wygrywa pierwsze niepuste źródło:

| Kolejność | Źródło | Kiedy używać |
|---|---|---|
| 1 | zmienna w powłoce albo w CI | `RP_APIKEY=... npm run test:vrt:rp`, sekrety w pipeline |
| 2 | `reportportal/.env` | praca lokalna, plik jest w `.gitignore` |
| 3 | `reportportal/rp.json` | alternatywa dla `.env`, też w `.gitignore` |
| 4 | gałąź z gita | tylko atrybut `branch` przy przebiegu |

Log startowy pokazuje, co się złożyło, z zamaskowanym kluczem:

```
[rp] endpoint=http://localhost:8080/api/v2 project=aitesters_vrt launch=AiTesters VRT apiKey=***
```

Brak konfiguracji **nie jest błędem**. Bez `.env` specki lecą lokalnie z reporterem `list`
i jednym ostrzeżeniem, więc ktoś bez Dockera nadal ma zielony bieg.

## Nie działa?

| Objaw | Przyczyna |
|---|---|
| Testy zielone, ale w panelu pusto | `RP_PROJECT` nie zgadza się co do znaku z nazwą projektu w panelu. Agent nie krzyczy, bo błędy sieci połyka we własnym `catch` |
| `401` w logach agenta | Klucz API wygasł albo trafiło tam hasło do panelu zamiast klucza z profilu |
| Hasło `erebus` nie działa | Działa tylko przy pierwszym starcie na pustej bazie. Później zmienia je wyłącznie panel, a `npm run rp:reset` pozwala ustawić je od nowa |
| Stack wstaje wolno albo usługa pada | Domyślnie potrzeba 6 GB RAM dla Dockera. Na słabszej maszynie użyj `npm run rp:up:lite` |
| Auto-Analysis nic nie oznacza | Model potrzebuje ręcznie oznaczonych defektów, progi to 100 i 300 elementów zależnie od modelu. Pierwszego dnia nie zadziała i to jest normalne. Na zajęciach historię daje `npm run rp:seed` |
| Panel nie odpowiada na 8080 | Port zajmuje coś innego. Przestaw `RP_UI_PORT` w `reportportal/.env` |
| Kontener bazy nie wstaje | Sprawdź, czy nie chodzi drugi stack z tą samą nazwą kontenera. Ten compose celowo nie ustawia `container_name` |

## W CI

```yaml
- name: Testy wizualne z raportem w ReportPortalu
  run: npm run test:vrt:rp
  env:
    RP_ENDPOINT: ${{ vars.RP_ENDPOINT }}
    RP_PROJECT: ${{ vars.RP_PROJECT }}
    RP_APIKEY: ${{ secrets.RP_APIKEY }}
    RP_BRANCH: ${{ github.head_ref || github.ref_name }}
```

Klucz idzie przez `secrets`, nigdy przez plik w repo. `RP_BRANCH` nadpisuje gałąź
odczytywaną z gita, bo w CI `HEAD` bywa odłączony.

## Telemetria

Klient JS ReportPortala domyślnie wysyła zdarzenie startu przebiegu do Google Analytics.
Szablon `.env.example` wyłącza to przez `REPORTPORTAL_CLIENT_JS_NO_ANALYTICS=true`.
Warto o tym wiedzieć, jeśli stawiasz narzędzie u siebie właśnie po to, żeby dane
nie wychodziły na zewnątrz.

## Sprzątanie

```bash
npm run rp:down     # zatrzymuje stack, dane zostają
npm run rp:reset    # zatrzymuje i kasuje wolumeny, czyli całą historię i hasło admina
```

## Czym ten katalog różni się od `tests/`

Specki `*.rp.spec.ts` leżą **poza** `tests/`, bo root config ma `testDir: './tests'`.
Dzięki temu `npx playwright test` nigdy ich nie podniesie i nie zrobi czerwonego biegu
komuś bez Dockera. Uruchamia je wyłącznie `npm run test:vrt:rp`, przez własny config.
Ta sama zasada co w `vrt-tracker/`, spisana w `PLAYWRIGHT_GUIDELINES.md` §10.

Baseline'y tych specek są lokalne (`reportportal/__screenshots__/`, w `.gitignore`),
tak samo jak `tests/__screenshots__/`.
