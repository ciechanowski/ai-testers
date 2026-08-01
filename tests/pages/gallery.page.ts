import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * GalleryPage – strona /gallery. Tylko locatory + akcje (SRP).
 * Dane (artworks) i sieć (mock) wstrzykujesz w specu przez factory + mock-handlers.
 */
export class GalleryPage extends BasePage {
  readonly path = '/gallery';
  readonly grid: Locator;
  readonly sidebar: Locator;

  constructor(page: Page) {
    super(page);
    this.grid = page.getByTestId('artwork-grid');
    this.sidebar = page.getByTestId('gallery-sidebar');
  }

  /** Karty dzieł w gridzie (do asercji liczby w specu). */
  cards(): Locator {
    return this.grid.locator('article');
  }
}
