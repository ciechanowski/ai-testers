import { readFileSync } from 'node:fs';

function load(name: string): string {
  return readFileSync(new URL(`./${name}.md`, import.meta.url), 'utf8').trim();
}

function withContext(name: string, context: string): string {
  return load(name).replace('{{context}}', context);
}

export const triagePrompt = (context: string): string =>
  withContext('s01/s01-l01-triage', context);

export const explainerPrompt = (context: string): string =>
  withContext('s01/s01-l02-explainer', context);

export const htmlAnalyzerPrompt = (): string => load('s01/s01-l03-html-analyzer');

export const flakeRootCausePrompt = (): string => load('s01/s01-l03-flake-root-cause');

export const responsiveDiffPrompt = (context: string): string =>
  withContext('s02/s02-l01-responsive-diff', context);

export const darkModeAuditPrompt = (context: string): string =>
  withContext('s02/s02-l01-darkmode-audit', context);

export const ariaMigrationPrompt = (context: string): string =>
  withContext('s02/s02-l03-aria-migration', context);

// S03 — kod, nie triage obrazków: prompty otwierasz wprost z s03/ w Cursorze
// (jak L01 w S01). Code-gen: {{context}} = płaski test / spec; review: wklejasz plik.
export const factoryGeneratePrompt = (context: string): string =>
  withContext('s03/s03-l01-factory-generate', context);

export const determinismReviewPrompt = (): string =>
  load('s03/s03-l01-determinism-review');

export const pomRefactorPrompt = (context: string): string =>
  withContext('s03/s03-l02-pom-refactor', context);

export const solidReviewPrompt = (): string => load('s03/s03-l02-solid-review');

export const skillDraftPrompt = (): string => load('s03/s03-l03-skill-draft');

export const triggerReviewPrompt = (): string => load('s03/s03-l03-trigger-review');

export const thresholdSuggestPrompt = (context: string): string =>
  withContext('s03/bonus/s03-b01-threshold-suggest', context);

export const falsePositivePrompt = (context: string): string =>
  withContext('s03/bonus/s03-b01-false-positive', context);
