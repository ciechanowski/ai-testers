# Visual Regression Tracker (S04L01)

Kod do lekcji **S04/L01**: własny panel VRT postawiony w Dockerze i agent Playwright, który wysyła do niego zrzuty.

Czym to się różni od `tests/visual/`: tam baseline jest plikiem PNG i porównuje go `toHaveScreenshot()`. Tutaj baseline leży w bazie trackera, porównanie robi serwer, a decyzję „zatwierdzam albo odrzucam” podejmuje człowiek klikiem w panelu. W tym katalogu nie powstaje ani jeden lokalny plik baseline'u.

Opis lekcji znajdziesz na platformie kursu. Prompty AI do tej lekcji leżą w [`S04/L01/PROMPT.md`](../S04/L01/PROMPT.md), a praca zespołowa na tym samym trackerze, czyli baseline per gałąź, sześć statusów i zatwierdzanie z flagą `merge`, to [`S04/L03/PROMPT.md`](../S04/L03/PROMPT.md).

## Wymagania

- Docker Desktop albo Docker Engine 24+, z Compose v2 (komenda `docker compose`, nie `docker-compose`)
- Node.js 20.12+ albo 22 LTS (loader konfiguracji korzysta z `process.loadEnvFile`)
- Wolne porty **8082**, **4200** i **5432**. Przestawisz je w `vrt-tracker/.env`, patrz [`.env.example`](.env.example)
- Panel celowo nie stoi na 8080, bo ReportPortal z S05 zajmuje 8080 i 8081 naraz

## Od zera, sześć kroków

**1. Zależności** (z korzenia repozytorium):

```bash
npm install
```

**2. Podnieś tracker:**

```bash
npm run tracker:up
npm run tracker:logs      # Ctrl+C, gdy logi ucichną
```

Serwis `migration` zakłada schemat bazy i konto, po czym kończy pracę. To normalne, że `docker compose ps` pokazuje go jako `Exited (0)`.

**3. Wejdź do panelu:** [http://localhost:8082](http://localhost:8082), logowanie `visual-regression-tracker@example.com` / `123456`.

Te dane są zaszyte w obrazie migracji i nie da się ich podmienić zmiennymi w compose. Własnego użytkownika zakładasz w panelu.

Załóż projekt o nazwie **`AiTesters Gallery`**. Musi zgadzać się z konfiguracją co do znaku, inaczej dostaniesz `Project not found`.

**4. Skopiuj szablony konfiguracji:**

```bash
cp vrt-tracker/.env.example vrt-tracker/.env
cp vrt-tracker/vrt.example.json vrt-tracker/vrt.json
```

W PowerShell: `Copy-Item vrt-tracker\.env.example vrt-tracker\.env`

Klucz startowy z `.env.example` działa od razu po `tracker:up`. Gdy wygenerujesz własny w panelu (menu użytkownika, API key), podmień `VRT_APIKEY` w pliku `.env`.

**5. Wystartuj aplikację** (albo pozwól, żeby `webServer` zrobił to za Ciebie):

```bash
npm run dev
```

**6. Uruchom testy:**

```bash
npm run test:vrt:tracker
```

## Co zobaczysz przy pierwszym biegu

W panelu pojawią się dwa wpisy, `Gallery` i `Homepage`, oba ze statusem `new`, a w konsoli zobaczysz `No baseline: <url>`. Baseline'u jeszcze nie ma, więc nie ma z czym porównywać. Przy `VRT_ENABLESOFTASSERT=true` z `.env.example` bieg mimo to kończy się na zielono, a komunikat trafia tylko do konsoli.

Obejrzyj oba zrzuty w panelu i kliknij **Approve**. Uruchom testy ponownie, a statusy zmienią się na `ok`.

## Jak zobaczyć różnicę

Najprościej przełącz `colorScheme` na `'dark'` w [`playwright.config.ts`](playwright.config.ts) i uruchom jeszcze raz. Oba testy wrócą ze statusem `unresolved` i różnicą rzędu 81%, a w panelu dostaniesz baseline, aktualny zrzut i mapę różnic obok siebie.

Warto wiedzieć, dlaczego akurat tak. `colorScheme` **nie wchodzi** do klucza wariantu, więc tracker traktuje ciemny motyw jako różnicę na tym samym teście, a nie jako osobny baseline. Klucz to nazwa, przeglądarka, urządzenie, system, rozdzielczość, znaczniki własne i gałąź. Gdybyś chciał trzymać jasny i ciemny motyw jako dwa niezależne baseline'y, musisz rozdzielić je czymś, co w tym kluczu faktycznie jest: inną nazwą przekazaną do `trackPage`, innym `agent.device` albo osobnym projektem o innej rozdzielczości.

Stąd też ostrożność z dokładaniem projektów: każdy nowy mnoży liczbę wariantów, a więc i baseline'ów do zatwierdzenia. Dlatego lekcja zostaje przy jednym.

## Skąd bierze się konfiguracja

Wygrywa pierwsze niepuste źródło:

| Kolejność | Źródło | Do czego |
|---|---|---|
| 1 | zmienna w powłoce, sekret CI | `VRT_APIKEY=... npm run test:vrt:tracker` |
| 2 | `vrt-tracker/.env` | Twoje lokalne ustawienia, poza repozytorium |
| 3 | `vrt-tracker/vrt.json` | wartości projektu, poza repozytorium |
| 4 | bieżąca gałąź z gita | tylko dla `branchName` |

Jednym zdaniem: **`vrt.json` trzyma wartości domyślne projektu, `.env` to Twoje lokalne nadpisanie, a powłoka i CI mają ostatnie słowo. Klucz API wyłącznie w `.env` albo w sekretach.**

Nie musisz w to wierzyć na słowo. `beforeAll` wypisuje jedną linię z tym, co faktycznie wygrało, z zamaskowanym kluczem:

```
[vrt] apiUrl=http://localhost:4200 project=AiTesters Gallery branchName=s04 enableSoftAssert=true apiKey=***
```

Oba pliki lokalne są w `.gitignore`, a szablony `.example` zostają w repozytorium.

## Maska, ignoreAreas i tolerancja

Trzy różne narzędzia, łatwe do pomylenia:

- **`mask`** z `maskColor: '#FF00FF'` przekazujesz w `screenshotOptions`, czyli działa po stronie Playwrighta, zanim zrzut poleci na serwer. Bierze locatory, więc znosi zmiany układu i trzy języki interfejsu. To domyślne narzędzie kursu.
- **`ignoreAreas`** to opcja trackera i bierze współrzędne `x`, `y`, `width`, `height`, przez co jest krucha. Obszary trwałe wygodniej zaznaczyć myszką w panelu, o czym mówi S04L03.
- **`diffTollerancePercent`** to procent niezgodnych pikseli, czyli odpowiednik `maxDiffPixelRatio`. Nie mylić z `threshold`, którego kurs nie podnosi ([`PLAYWRIGHT_GUIDELINES.md`](../PLAYWRIGHT_GUIDELINES.md) §3.3).

## Nie działa?

| Objaw | Przyczyna |
|---|---|
| `No response from server` | Docker nie stoi. Uruchom `npm run tracker:up` |
| `apiKey is not specified` | Brak plików `.env` i `vrt.json`. Wróć do kroku 4 |
| `401`, `Api key not authenticated` | Klucz z innego projektu albo baza wyczyszczona przez `tracker:reset` |
| `Project not found` | Nazwa projektu w panelu inna niż `VRT_PROJECT` |
| Puste miniatury w panelu | `api` i `ui` nie widzą wspólnego wolumenu obrazów. Sprawdź sekcję `volumes` w pliku compose |
| `migration` w pętli restartów | Baza nie wstała. Zrób `npm run tracker:reset`, potem `tracker:up` jeszcze raz |
| Port zajęty | Ustaw `VRT_UI_PORT`, `VRT_API_PORT` albo `VRT_DB_PORT` w `.env`. Najczęściej winny jest ReportPortal z S05 |

## W CI

```yaml
- run: npm run test:vrt:tracker
  env:
    VRT_APIURL: ${{ secrets.VRT_APIURL }}
    VRT_APIKEY: ${{ secrets.VRT_APIKEY }}
    VRT_BRANCHNAME: ${{ github.head_ref || github.ref_name }}
    VRT_CIBUILDID: ${{ github.run_id }}
    VRT_ENABLESOFTASSERT: 'false'
```

Dwie rzeczy trzeba tu zrobić inaczej niż lokalnie. `enableSoftAssert` musi być `false`, bo w przeciwnym razie różnica nie zatrzyma pipeline'u. Tracker musi też stać pod adresem widocznym dla maszyny budującej, nie na `localhost`, bo lokalny panel widzisz tylko Ty.

## Sprzątanie

```bash
npm run tracker:down     # zatrzymuje, dane zostają
npm run tracker:reset    # zatrzymuje i kasuje bazę oraz zrzuty
```

`tracker:reset` kasuje wszystkie baseline'y bez pytania. Na trackerze zespołu wolumen bazy trzeba objąć kopiami zapasowymi, bo to jedyne miejsce, w którym te baseline'y istnieją. W repozytorium ich nie ma.
