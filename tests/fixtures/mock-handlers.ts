import { expect, type Page, type Route } from '@playwright/test';
import {
  createArtworkList,
  createArtistList,
  createTestimonialList,
  createInsightList,
} from './artwork.factory';

export async function mockAllApis(page: Page): Promise<void> {
  const artworks = createArtworkList(6);
  const artists = createArtistList();
  const testimonials = createTestimonialList();
  const insights = createInsightList();

  await page.route('**/api/artworks', (route: Route) =>
    route.fulfill({ status: 200, json: artworks }),
  );

  await page.route('**/api/artworks/*', (route: Route) => {
    const url = route.request().url();
    const id = url.split('/api/artworks/')[1];
    const artwork = artworks.find((a) => a.id === id);
    if (artwork) {
      return route.fulfill({ status: 200, json: artwork });
    }
    return route.fulfill({ status: 404, json: { error: 'Not found' } });
  });

  await page.route('**/api/artists', (route: Route) =>
    route.fulfill({ status: 200, json: artists }),
  );

  await page.route('**/api/testimonials', (route: Route) =>
    route.fulfill({ status: 200, json: testimonials }),
  );

  // /api/insights celowo dryfuje po stronie serwera — bez tego mocka baseline to szum
  await page.route('**/api/insights', (route: Route) =>
    route.fulfill({ status: 200, json: insights }),
  );
}

export async function stabilizePage(page: Page): Promise<void> {
  // Gotowość strony przez jawną web assertion na <main> — NIE networkidle
  // (DISCOURAGED: wisi w aplikacji z analytics/pollingiem). Patrz S01/L03.
  await expect(page.getByRole('main')).toBeVisible();
}
