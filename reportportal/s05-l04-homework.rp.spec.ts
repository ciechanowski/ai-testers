/**
 * S05L04, praca domowa: dziewięć wyników i jedno pytanie, co łączy te czerwone.
 *
 * Trzy strony razy trzy projekty Playwrighta dają jeden przebieg z dziewięcioma
 * wynikami. Każdy dostaje atrybuty `viewport`, `colorScheme` i `device` z rp.attributes.ts,
 * a do tego `page`, czyli czwarty atrybut dołożony na potrzeby tego zadania. To on
 * pozwala odróżnić „sypie się jedna strona" od „sypie się jedno środowisko".
 *
 * Regresja nie jest tu włączana parametrem `?vrt=` jak w S05L01. Adres strony trafia
 * do panelu jako nazwa kroku, więc `?vrt=card-design` byłoby gotową odpowiedzią i dla
 * Ciebie, i dla agenta przez MCP. Zamiast tego test dokłada arkusz stylów, a panel
 * dostaje to samo, co dostałby przy prawdziwej regresji: wyniki, atrybuty i zrzuty.
 *
 * Dwa biegi, w tej kolejności:
 *
 *   npm run test:vrt:hw -- --update-snapshots   # bieg czysty, nagrywa baseline'y
 *   npm run test:vrt:hw                         # bieg z regresją, po ustawieniu HW_SEED
 *
 * HW_SEED to Twoje imię wpisane do reportportal/.env. Puste ziarno znaczy bieg czysty.
 * Plik .env czyta rp.config.ts przy starcie konfiguracji, więc zmienna działa tak samo
 * w PowerShellu, w zsh i w bashu, bez sztuczek ze składnią powłoki.
 */
import { test, expect, type Locator, type Page } from '@playwright/test';
import { ReportingApi } from '@reportportal/agent-js-playwright';
import { GalleryPage } from '../tests/pages/gallery.page';
import { mockAllApis, stabilizePage } from '../tests/fixtures/mock-handlers';
import { attributesForProject } from './rp.attributes';
import { variantForSeed } from './hw.regression';

const FROZEN_TIME = new Date('2026-01-15T12:00:00Z');
const ARTWORKS_ON_FIRST_PAGE = 6;

/** Wariant jest wyliczany raz, przy wczytaniu pliku, więc jest ten sam dla wszystkich testów. */
const variant = variantForSeed(process.env.HW_SEED);

interface HomeworkPage {
  /** Wartość atrybutu `page` w panelu. Krótka, bo wchodzi do legendy widgetu. */
  key: string;
  title: string;
  path: string;
  snapshot: string;
  /** Jawna asercja na gotowość strony. Żadnego networkidle ani waitForTimeout. */
  ready: (page: Page) => Promise<void>;
  /** Regiony zasłaniane maską, czyli te, których zawartość zmienia się sama z siebie. */
  mask?: (page: Page) => Locator[];
}

const PAGES: HomeworkPage[] = [
  {
    key: 'gallery',
    title: 'Galeria: siatka prac i panel filtrów',
    path: '/gallery',
    snapshot: 'hw-gallery.png',
    ready: async (page) => {
      await expect(new GalleryPage(page).cards()).toHaveCount(ARTWORKS_ON_FIRST_PAGE);
    },
  },
  {
    key: 'artwork',
    title: 'Szczegóły pracy: opis i prace powiązane',
    path: '/artwork/art-001',
    snapshot: 'hw-artwork.png',
    ready: async (page) => {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    },
  },
  {
    key: 'about',
    title: 'O nas: tekst redakcyjny i zespół',
    path: '/about',
    snapshot: 'hw-about.png',
    ready: async (page) => {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    },
    // Licznik statystyk dolicza się animacją po wjechaniu w kadr, więc zasłaniamy pasek
    // maską zamiast go ukrywać: układ strony zostaje ten sam, znika tylko zmienna treść.
    mask: (page) => [page.getByRole('region', { name: 'Statistics' })],
  },
];

test.describe('S05L04: co łączy te czerwone', () => {
  for (const target of PAGES) {
    test(target.title, async ({ page }, testInfo) => {
      ReportingApi.addAttributes([
        ...attributesForProject(testInfo.project.name),
        { key: 'page', value: target.key },
        { key: 'variant', value: variant ? String(variant.id) : 'clean' },
      ]);

      ReportingApi.setDescription(
        variant
          ? `Bieg z regresją, wariant ${variant.id}. Przyczyny szukaj w rozkładzie atrybutów, nie w nazwie testu.`
          : 'Bieg czysty, materiał na baseline.',
      );

      // Zegar zamrożony PRZED goto: po nawigacji strona zdążyła już odczytać czas,
      // a na tych stronach zależą od niego daty względne i rok w stopce.
      await page.clock.setFixedTime(FROZEN_TIME);
      await mockAllApis(page);
      await page.goto(target.path);
      await stabilizePage(page);
      await target.ready(page);

      if (variant) {
        await test.step('build pod testem: arkusz stylów aplikacji', async () => {
          await page.addStyleTag({ content: variant.css });
        });
      }

      // Playwright sam dopina expected, actual i diff do nieudanego wyniku,
      // a agent sam wysyła tę trójkę do panelu jako załączniki.
      //
      // Tolerancja idzie przez maxDiffPixels, nigdy przez podniesienie threshold.
      // 400 to zapas na wygładzanie czcionek: najmniejsza prawdziwa regresja w tym
      // zadaniu zmienia około 3300 pikseli, więc próg nadal jest od niej ośmiokrotnie
      // niższy i żadnego z trzech wariantów nie przepuści.
      await expect(page).toHaveScreenshot(target.snapshot, {
        fullPage: true,
        mask: target.mask?.(page) ?? [],
        maskColor: '#FF00FF',
        maxDiffPixels: 400,
      });
    });
  }
});
