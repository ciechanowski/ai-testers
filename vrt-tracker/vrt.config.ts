/**
 * Konfiguracja agenta VRT. Wygrywa pierwsze niepuste źródło:
 * powłoka lub CI, potem vrt-tracker/.env, potem vrt-tracker/vrt.json, na końcu gałąź z gita.
 *
 * Czytamy oba pliki sami, bo SDK przy jawnym configu wyłącza własny fallback,
 * a `vrt.json` szuka względem katalogu uruchomienia, czyli w korzeniu repo.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Config } from '@visual-regression-tracker/agent-playwright';

const here = (file: string): string => fileURLToPath(new URL(file, import.meta.url));

const ENV_FILE = here('.env');
const JSON_FILE = here('vrt.json');

interface VrtFileConfig {
  apiUrl?: string;
  project?: string;
  apiKey?: string;
  branchName?: string;
  baselineBranchName?: string;
  enableSoftAssert?: boolean;
  ciBuildId?: string;
}

// Node nie nadpisuje zmiennych już ustawionych w powłoce, więc plik tylko uzupełnia luki.
function loadEnvFile(): void {
  if (!existsSync(ENV_FILE)) return;
  process.loadEnvFile(ENV_FILE);
}

function readJsonFile(): VrtFileConfig {
  if (!existsSync(JSON_FILE)) return {};
  return JSON.parse(readFileSync(JSON_FILE, 'utf8')) as VrtFileConfig;
}

function gitBranch(): string | undefined {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return undefined;
  }
}

function required(value: string | undefined, name: string, hint: string): string {
  if (value) return value;
  throw new Error(
    `[vrt] Missing "${name}". ${hint}\n` +
      'Resolution order: shell environment, then vrt-tracker/.env, then vrt-tracker/vrt.json.',
  );
}

export function loadVrtConfig(): Config {
  loadEnvFile();
  const file = readJsonFile();

  return {
    apiUrl: required(
      process.env.VRT_APIURL ?? file.apiUrl,
      'apiUrl',
      'Set VRT_APIURL or the apiUrl field in vrt.json (locally http://localhost:4200).',
    ),
    project: required(
      process.env.VRT_PROJECT ?? file.project,
      'project',
      'A project with this exact name must exist in the tracker dashboard.',
    ),
    apiKey: required(
      process.env.VRT_APIKEY ?? file.apiKey,
      'apiKey',
      'Copy the key from the dashboard (user menu, API key) into vrt-tracker/.env.',
    ),
    branchName: required(
      process.env.VRT_BRANCHNAME ?? file.branchName ?? gitBranch(),
      'branchName',
      'Without a branch name the tracker loses its reference point and reports false diffs.',
    ),
    baselineBranchName: process.env.VRT_BASELINEBRANCHNAME ?? file.baselineBranchName,
    enableSoftAssert:
      (process.env.VRT_ENABLESOFTASSERT ?? String(file.enableSoftAssert ?? false)) === 'true',
    ciBuildId: process.env.VRT_CIBUILDID ?? file.ciBuildId,
  };
}

// Klucz zawsze zamaskowany, bo log potrafi wylądować w artefakcie CI.
export function describeVrtConfig(config: Config): string {
  return [
    '[vrt]',
    `apiUrl=${config.apiUrl}`,
    `project=${config.project}`,
    `branchName=${config.branchName}`,
    `enableSoftAssert=${config.enableSoftAssert}`,
    'apiKey=***',
  ].join(' ');
}
