/**
 * S05L04: regresja do pracy domowej i klucz odpowiedzi.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  TU JEST ODPOWIEDŹ. Otwórz ten plik dopiero wtedy, gdy postawisz tezę    │
 * │  w panelu i dostaniesz odpowiedź od agenta przez MCP. Do uruchomienia     │
 * │  zadania nie musisz tu zaglądać: wystarczy HW_SEED w reportportal/.env.  │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Wariant wybiera ziarno HW_SEED, czyli Twoje imię wpisane do `.env`. Dzięki temu
 * dwie osoby z jednej sali dostają różne przypadki, a Twój wybór jest stały przez
 * cały przebieg: gdyby losował się per test, czerwone wyniki rozsypałyby się
 * po wszystkich projektach i żaden atrybut niczego by nie rozdzielał.
 *
 * Regresja wchodzi arkuszem stylów wstrzykniętym w teście, a nie parametrem `?vrt=`
 * jak w S05L01. To celowa różnica: adres strony trafia do ReportPortala jako nazwa
 * kroku, więc `?vrt=card-design` byłoby gotową odpowiedzią i dla Ciebie, i dla agenta.
 * Tutaj panel widzi wyłącznie wyniki, atrybuty i zrzuty, czyli dokładnie to, co widzi
 * osoba robiąca triage w prawdziwym zespole.
 */

export interface HomeworkVariant {
  /** Numer wariantu, trafia do panelu jako atrybut `variant`. */
  id: number;
  /** Reguły dopisywane do strony tuż przed zrzutem. */
  css: string;
}

const VARIANTS: HomeworkVariant[] = [
  {
    id: 1,
    // Kolor tekstu treści w ciemnym motywie. Selektor wymaga klasy `dark` na <html>,
    // którą nakłada hook useDarkMode, więc w jasnym motywie nie zmienia się ani piksel.
    css: `
      html.dark main p,
      html.dark main li { color: #4b5563 !important; }
    `,
  },
  {
    id: 2,
    // Panel filtrów galerii ma klasy `hidden lg:block`, czyli poniżej 1024 px jest ukryty
    // z założenia. Reguła chowa go także powyżej tego progu, więc na telefonie zrzut
    // zostaje bez zmian, a na desktopie znika cała kolumna filtrów.
    css: `
      @media (min-width: 1024px) {
        [data-testid="gallery-sidebar"] { display: none !important; }
      }
    `,
  },
  {
    id: 3,
    // Nowy styl karty: ostre rogi i akcentowa ramka. Nie zależy ani od motywu,
    // ani od szerokości ekranu, za to widać go tylko tam, gdzie w ogóle są karty.
    css: `
      article.artwork-card {
        border-radius: 0 !important;
        border-color: #14b8a6 !important;
      }
    `,
  },
];

/**
 * Wariant dla ziarna. Puste ziarno oznacza bieg czysty, czyli ten, na którym
 * nagrywasz baseline'y. Suma punktów kodowych wystarczy: to ma być powtarzalne
 * i czytelne, a nie odporne na zgadywanie.
 */
export function variantForSeed(seed: string | undefined): HomeworkVariant | undefined {
  const normalized = seed?.trim().toLowerCase();
  if (!normalized) return undefined;

  const sum = [...normalized].reduce((acc, char) => acc + (char.codePointAt(0) ?? 0), 0);
  return VARIANTS[sum % VARIANTS.length];
}

/*
 * ───────────────────────────── KLUCZ ODPOWIEDZI ─────────────────────────────
 *
 * Wariant 1: oś to `colorScheme=dark`.
 *   Czerwone są wszystkie trzy strony, ale tylko w projekcie rp-desktop-dark.
 *   Projekty rp-desktop-light i rp-desktop-dark różnią się wyłącznie motywem,
 *   a jeden jest zielony i jeden czerwony, więc rozdziela je motyw, nie rozdzielczość.
 *   Przyczyna: kolor tekstu treści w ciemnym motywie zszedł do gray-600, czyli
 *   kontrast spadł poniżej progu WCAG AA. Etykieta: Product Bug.
 *
 * Wariant 2: oś to `device=desktop`, dodatkowo `page=gallery`.
 *   Czerwona jest jedna strona w dwóch projektach desktopowych, telefon zielony.
 *   Przyczyna: panel filtrów, chowany celowo poniżej 1024 px, znika także powyżej,
 *   więc na desktopie nie ma czym filtrować. Etykieta: Product Bug.
 *
 * Wariant 3: żaden atrybut środowiska nie rozdziela wyników.
 *   Czerwone są dwie strony we wszystkich trzech projektach, zielona zostaje ta,
 *   która nie ma kart. Rozdziela `page`, a nie motyw ani urządzenie, więc problem
 *   siedzi w treści strony, nie w środowisku. Przyczyna: karty dostały nowy styl
 *   ramki i rogów. Zestawione z kontekstem sprintu ze zlecenia zadania („zespół
 *   designu zmienił styl kart") daje to nieaktualny baseline, czyli Automation Bug.
 *
 * Puenta wspólna dla wszystkich trzech: ten sam czerwony wynik znaczy trzy różne
 * rzeczy, a rozstrzyga o tym rozkład atrybutów, nie wygląd pojedynczego zrzutu.
 *
 * Zmierzone na aplikacji kursu, w pikselach różnicy wobec biegu czystego:
 *
 *   wariant 1: gallery 3,3 tys., artwork 6,8 tys., about 31,6 tys., wyłącznie w dark
 *   wariant 2: gallery na desktopie zmienia wysokość strony, reszta zero
 *   wariant 3: gallery 8 tys. do 87 tys. i artwork 3,4 tys. do 29 tys. we wszystkich
 *              projektach, about zero
 *
 * Każda z tych wartości jest o rząd wielkości powyżej progu maxDiffPixels ze specki,
 * więc wynik nie zależy od tego, na jakiej maszynie zadanie jest robione.
 */
