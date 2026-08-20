/**
 * Konfiguracja agenta ReportPortala. Wygrywa pierwsze niepuste źródło:
 * powłoka lub CI, potem reportportal/.env, potem reportportal/rp.json, na końcu gałąź z gita.
 *
 * Ten sam układ co w `vrt-tracker/vrt.config.ts`, żeby oba narzędzia kursu konfigurowało się
 * tak samo. Różnica jest jedna i celowa: brak konfiguracji NIE jest tutaj błędem.
 * `isRpConfigured()` pozwala puścić specki lokalnie, bez stojącego ReportPortala,
 * i to jest domyślne zachowanie dla kogoś, kto nie ma Dockera.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (file: string): string => fileURLToPath(new URL(file, import.meta.url));

const ENV_FILE = here('.env');
const JSON_FILE = here('rp.json');

/**
 * Wycinek `ReportPortalConfig` z agenta, ograniczony do pól, których używa kurs.
 * Paczka nie eksportuje tego typu z korzenia, a import ze ścieżki `build/models/configs`
 * potrafi się zmienić między wydaniami, więc trzymamy tutaj własny, wąski kontrakt.
 */
export interface RpConfig {
  endpoint: string;
  project: string;
  apiKey: string;
  launch: string;
  attributes: Array<{ key?: string; value: string }>;
  description?: string;
  includeTestSteps: boolean;
  includePlaywrightProjectNameToCodeReference: boolean;
  uploadTrace: boolean;
  restClientConfig: { timeout: number };
}

interface RpFileConfig {
  endpoint?: string;
  project?: string;
  apiKey?: string;
  launch?: string;
}

const PLACEHOLDERS = ['REPLACE_WITH_PROJECT_NAME', 'REPLACE_WITH_API_KEY_FROM_PROFILE'];

// Node nie nadpisuje zmiennych już ustawionych w powłoce, więc plik tylko uzupełnia luki.
function loadEnvFile(): void {
  if (!existsSync(ENV_FILE)) return;
  process.loadEnvFile(ENV_FILE);
}

function readJsonFile(): RpFileConfig {
  if (!existsSync(JSON_FILE)) return {};
  return JSON.parse(readFileSync(JSON_FILE, 'utf8')) as RpFileConfig;
}

function gitBranch(): string {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

// Wartość z podmienionym placeholderem z szablonu liczy się jako brak wartości.
function real(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return PLACEHOLDERS.includes(value) ? undefined : value;
}

function raw(): Required<RpFileConfig> | { endpoint?: string; project?: string; apiKey?: string; launch?: string } {
  loadEnvFile();
  const file = readJsonFile();
  return {
    endpoint: real(process.env.RP_ENDPOINT) ?? real(file.endpoint),
    project: real(process.env.RP_PROJECT) ?? real(file.project),
    apiKey: real(process.env.RP_APIKEY) ?? real(file.apiKey),
    launch: real(process.env.RP_LAUNCH) ?? real(file.launch) ?? 'AiTesters VRT',
  };
}

/**
 * Czy da się w ogóle wysyłać do ReportPortala. Bez tego pytania każdy bieg bez `.env`
 * kończyłby się wyjątkiem, a chcemy, żeby specki działały też offline.
 */
export function isRpConfigured(): boolean {
  const { endpoint, project, apiKey } = raw();
  return Boolean(endpoint && project && apiKey);
}

export function loadRpConfig(): RpConfig {
  const { endpoint, project, apiKey, launch } = raw();

  if (!endpoint || !project || !apiKey) {
    throw new Error(
      '[rp] Missing endpoint, project or apiKey.\n' +
        'Copy reportportal/.env.example to reportportal/.env and fill RP_PROJECT and RP_APIKEY.\n' +
        'Resolution order: shell environment, then reportportal/.env, then reportportal/rp.json.\n' +
        'RP_PROJECT is the project name exactly as created in the panel.',
    );
  }

  return {
    endpoint,
    project,
    apiKey,
    launch: launch ?? 'AiTesters VRT',
    // Atrybuty poziomu przebiegu. Te per test dokłada rp.attributes.ts.
    attributes: [
      { key: 'suite', value: 'visual' },
      { key: 'branch', value: process.env.RP_BRANCH ?? gitBranch() },
    ],
    description: 'Testy wizualne Pixelarium, kurs AI Testers',
    // Wysyła wszystkie kroki Playwrighta, nie tylko te z test.step().
    includeTestSteps: true,
    // Bez tego trzy projekty Playwrighta dzielą jeden codeRef i zlewają się w historii.
    includePlaywrightProjectNameToCodeReference: true,
    uploadTrace: true,
    // Host, który nie odrzuca połączeń, potrafi zawiesić zamykanie przebiegu.
    restClientConfig: { timeout: 15_000 },
  };
}

// Klucz zawsze zamaskowany, bo log potrafi wylądować w artefakcie CI.
export function describeRpConfig(config: RpConfig): string {
  return [
    '[rp]',
    `endpoint=${config.endpoint}`,
    `project=${config.project}`,
    `launch=${config.launch}`,
    'apiKey=***',
  ].join(' ');
}
