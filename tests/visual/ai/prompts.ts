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

// S03, kod zamiast triage obrazków: prompty otwierasz wprost z s03/ w Cursorze
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

// S04, kontekst agenta i metadane trackera zamiast pikseli: prompty otwierasz wprost
// z s04/ w Cursorze (jak S03). Sesja nie ma własnych specek, bo jej efektem pracy jest
// AGENTS.md z polityką zatwierdzania, więc te eksporty są spisem katalogu, nie zależnością testu.
// Generatory: {{context}} = zrzut JSON z API trackera, konwencje projektu, opis workflow.
// Review: wklejasz wygenerowany artefakt razem z jego źródłem.
export const trendAnalyzePrompt = (context: string): string =>
  withContext('s04/s04-l01-trend-analyze', context);

export const evidenceReviewPrompt = (): string => load('s04/s04-l01-evidence-review');

export const agentsMdGeneratePrompt = (context: string): string =>
  withContext('s04/s04-l02-agents-md-generate', context);

export const memoryReviewPrompt = (): string => load('s04/s04-l02-memory-review');

export const buildSummaryPrompt = (context: string): string =>
  withContext('s04/s04-l03-build-summary', context);

export const approvalPolicyPrompt = (): string => load('s04/s04-l03-approval-policy');

export const approvalReviewPrompt = (): string => load('s04/s04-l03-approval-review');

// L04, praca domowa: pamięć wyprowadzona z kodu zamiast podyktowanej, i naprawa reguły,
// która przegrała z prośbą użytkownika. {{context}} = ścieżki, które model ma przeczytać.
export const agentsMdDerivePrompt = (context: string): string =>
  withContext('s04/s04-l04-agents-md-derive', context);

export const ruleRepairPrompt = (): string => load('s04/s04-l04-rule-repair');
