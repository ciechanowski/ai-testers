import type { Page, TestInfo } from '@playwright/test';

export function demoUrl(basePath: string, caseMap: Record<string, string> = {}): string {
  const demo = process.env.VRT_DEMO;
  const vrtCase = demo ? caseMap[demo] : undefined;
  if (!vrtCase) return basePath;
  const sep = basePath.includes('?') ? '&' : '?';
  return `${basePath}${sep}vrt=${vrtCase}`;
}

export async function gotoDemo(
  page: Page,
  testInfo: TestInfo,
  basePath: string,
  caseMap: Record<string, string> = {},
): Promise<string> {
  const url = demoUrl(basePath, caseMap);
  testInfo.annotations.push({
    type: 'demo-url',
    description: url.includes('?vrt=') ? `regresja demo: ${url}` : `wersja czysta: ${url}`,
  });
  await page.goto(url);
  return url;
}
