# S02L04 – Solution Notes

> Modelowe rozwiązanie zadania „znajdź błąd, którego pixel diff nigdy nie pokaże".
> Spec: [`homework-s02-i18n.solution.visual.spec.ts`](homework-s02-i18n.solution.visual.spec.ts).

## Najważniejszy wniosek: test jest zielony, a strona jest zepsuta

To nie jest usterka rozwiązania – to jego **teza**. Uruchom modelowy spec:

```
6 passed (18.6s)     # --update-snapshots
6 passed (3.2s)      # run 2
6 passed (3.4s)      # run 3 – deterministycznie
```

Zielone. A `payouts-panel-de.png` zawiera przycisk z napisem **„Auszahlungseinste…"** –
ucięty i nieczytelny. Baseline **jest** tym błędem, więc nie ma się z czym różnić.

> Gdyby to była prawdziwa aplikacja, ten test pilnowałby zepsutego layoutu przez kolejne
> dwa lata i czerwieniłby się dopiero wtedy, gdy ktoś by go **naprawił**.

Dlatego jedynym mechanizmem, który tu cokolwiek wykrywa, jest **przegląd pierwszego
baseline'u** – i dlatego AI w tym zadaniu nie jest ozdobą.

## Audyt i18n – tabela werdyktów

Zmierzone w przeglądarce (`scrollWidth` kontra `clientWidth`), nie oszacowane:

| Element | Język / projekt | Obserwacja | Klasyfikacja | Przyczyna (Tailwind) | Fix |
|---|---|---|---|---|---|
| `payouts-submit` | de, oba viewporty | box 176px, tekst 280px → **ucięte** | **bug** | `w-44` + `overflow-hidden text-ellipsis` | `w-auto` + `min-w-44`, albo `whitespace-normal` i wyższy przycisk |
| `payouts-title` | de, tylko mobile (390px) | tytuł 382px w kontenerze 278px → **ucięty** do „Auszahlungseinstellun…" | **should_review** | `truncate` na `<h1>` + `flex` bez `flex-wrap` → tytuł nie ma dokąd się przenieść obok Ref | `flex-wrap` (Ref schodzi do drugiej linii), albo mniejszy `text-2xl` na mobile |
| `payouts-tabs` | de, tylko mobile (390px) | kontener 358px, treść 434px → **wyjeżdża** | **bug** | `whitespace-nowrap` bez `overflow-x-auto` | dodać `overflow-x-auto`, albo zawijać zakładki |
| `payouts-account` | de, tylko mobile | IBAN **ucięty** przez `truncate` | **should_review** | flex bez `min-w-0` → etykieta ma `min-width:auto` i nie zwęża się, więc ucina się wartość | `min-w-0` na `<dd>`, albo układ pionowy na mobile |
| `payouts-balance` | wszystkie | `$4,823.50` / `4823,50 zł` / `4.823,50 €` | **i18n-expected** | — | brak; **nie maskować** – to sygnał, nie szum |
| `payouts-next-date` | wszystkie | `July 22, 2026` / `22 lipca 2026` / `22. Juli 2026` | **i18n-expected** | — | brak; zamraża `page.clock` |
| `payouts-note` | de | zawija się na 3 linie zamiast 2 | **intended** | `max-w-prose` | brak – dłuższy tekst, wciąż czytelny |
| `balance.pending` | de | „Pending clearance" zamiast „Wartet auf Verrechnung" | **bug (treść)** | klucz nieprzetłumaczony w `de/payouts.json` – tłumacz go pominął | uzupełnić tłumaczenie w pliku locale |

**Odpowiedź na pytanie 4 promptu:** pixel diff nie złapie **żadnego** z tych bugów. Wszystkie
istnieją od pierwszego renderu, więc trafiają do baseline'u jako „prawda". Diff złapie je
dopiero, gdy ktoś je **naprawi** – i wtedy zgłosi naprawę jako regresję.

> **Pułapka `balance.pending`.** Ten błąd jest niewidoczny **podwójnie**. Pixel diff go nie
> złapie (jest w baseline). Ale nie wyróżni go też porównanie zrzutu **de** ze zrzutem **en** –
> bo string został po angielsku, więc w obu językach wygląda **identycznie**. Metoda „porównaj
> de z en i sklasyfikuj różnice" tu zawodzi: to nie jest różnica, a mimo to jest błędem. Łapie
> go wyłącznie ktoś, kto **czyta po niemiecku** i wie, że tu powinno stać „Wartet auf
> Verrechnung". Nie każdy brak różnicy oznacza poprawność.

## ARIA – co widzi kościec, czego nie widzi piksel

`tests/__screenshots__/desktop-light/visual/<spec>/payouts-tabs-{en,de}.aria.yml`:

```yaml
# en                                    # de
- navigation "Payout sections":         - navigation "Auszahlungsbereiche":
  - button "Overview"                     - button "Übersicht"
  - button "Methods"                      - button "Zahlungsmethoden"
  - button "History"                      - button "Auszahlungsverlauf"
```

**Różni się:** wyłącznie nazwy dostępne (tłumaczone przez `t()`).
**Identyczne:** role, zagnieżdżenie, liczba węzłów. Kościec nie zna języka – i o to chodzi.
Gdyby struktura różniła się między lokalizacjami, byłby to sygnał, nie tłumaczenie.

Druga część – dwa przyciski akcji, wizualnie bliźniacze:

```yaml
payouts-submit:  - button "Auszahlungseinstellungen speichern"   # natywny <button>
payouts-export:  - text: CSV exportieren                          # <div onClick> BEZ role
```

`payouts-export` jest **piksel w piksel** jak przycisk, więc screenshot nigdy tego nie
zgłosi. Użytkownik klawiatury nie dotrze do niego Tabem, a czytnik ekranu przeczyta go jako
zwykły tekst. Fix: natywny `<button>` – wtedy `.aria.yml` pokaże `- button "CSV exportieren"`.

> **Uwaga na częsty mit:** `<div role="button">` renderuje się w ARIA snapshot jako
> `- button "X"`, czyli **identycznie** jak natywny – tego ARIA snapshot **nie** wykryje.
> Łapie tylko element **bez roli**. Dlatego fixture używa wariantu bez roli.

## Bonus: `de-DE` – bug testu czy bug aplikacji?

**Bug aplikacji.** Zmierzone:

| `locale` | Cena | Podświetlone przyciski języka |
|---|---|---|
| `'de'` | `4.823,50 €` | 1 |
| `'de-DE'` | **`$4,823.50`** | **0** |

Dwie przyczyny, obie to dokładny lookup po `i18n.language`:

- `formatPrice.ts` – `currencyMap['de-DE']` i `localeMap['de-DE']` chybiają → fallback na
  `USD` + `en-US`. Amerykańskie dolary na niemieckiej stronie.
- `LanguageSwitcher.tsx` – `i18n.language === lng` przeciw `['en','pl','de']` → nic nie pasuje,
  więc żaden przycisk nie dostaje `bg-indigo-600` **ani** `aria-current`. Skażony baseline
  pikselowy **i** ARIA naraz.

Kluczowe: to **nie** jest artefakt testu. Prawdziwy niemiecki użytkownik z
`navigator.language === 'de-DE'` (czyli typowy) dostaje dokładnie to samo. Test tylko
**ujawnił** istniejący bug.

Poprawka w aplikacji: czytać `i18n.resolvedLanguage` (i18next rozwiązuje `de-DE` → `de`)
zamiast `i18n.language`. Obejście w teście: kod bez regionu, `locale: 'de'`. W kursie
zostawiamy `i18n.language`, żeby ten bug dało się odkryć – to realny przypadek z życia.

## Decyzje projektowe

- **Oś języka w specu (`test.use`), nie w `playwright.config.ts`.** `viewport` i `colorScheme`
  dotyczą całej suity → projekty. Język dotyczy jednej strony → spec. Nowy projekt bez
  `testMatch` przebaselinowałby S01+S02 po niemiecku; 3 layouty × 3 języki = 9 projektów
  i 3× więcej baselinów do review w każdym PR.
- **`-${lang}` w nazwie snapshotu.** `snapshotPathTemplate` rozdziela `{projectName}`, języków
  nie rozdziela nic. Bez tego trzy lokalizacje nadpisują ten sam plik.
- **Maska tylko na `payouts-ref`** (`Math.random`). `payouts-next-date` zostaje bez maski –
  zamraża go `page.clock`. Ceny i daty per locale **zostają bez maski**: to przedmiot testu.
- **Jedna strona × trzy języki**, nie cała apka × trzy języki. Dziesięć stron w trzech
  lokalizacjach to trzydzieści baselinów, które przerenderują się przy każdej zmianie
  nagłówka – nikt tego nie przegląda, więc gnije.
