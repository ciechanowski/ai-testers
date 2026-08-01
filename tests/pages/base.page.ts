import { type Page, type Locator } from '@playwright/test';

/**
 * BasePage – wspólny kontrakt stron (SOLID).
 *
 * SRP: Page Object trzyma TYLKO locatory i akcje strony. Zero asercji
 *      (te zostają w specu). Jeden powód do zmiany: zmiana UI strony.
 * OCP: nową stronę dodajesz przez nową podklasę, nie modyfikując bazy.
 * Współpracownicy (dane, sieć) wstrzykiwane z zewnątrz (factory, mock-handlers).
 */
export abstract class BasePage {
  readonly banner: Locator;
  readonly nav: Locator;
  readonly footer: Locator;

  constructor(protected readonly page: Page) {
    this.banner = page.getByRole('banner');
    this.nav = page.getByRole('navigation', { name: 'Main' });
    this.footer = page.getByRole('contentinfo');
  }

  /** Każda strona zna swój URL (template method). */
  abstract readonly path: string;

  async open(): Promise<void> {
    await this.page.goto(this.path);
    // explicit web assertion (NIE networkidle); to wait na gotowość, nie asercja testu
    await this.page.getByRole('main').waitFor({ state: 'visible' });
  }

  /** Dynamiczne regiony do maski w VRT (reuse między stronami). */
  dynamicRegions(): Locator[] {
    return [
      this.page.getByTestId('live-counter'),
      this.page.getByTestId('countdown-timer'),
    ];
  }
}
