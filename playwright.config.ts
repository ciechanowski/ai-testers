import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.visual.spec.ts', '**/*.visual.mcp.spec.ts'],

  snapshotPathTemplate:
    '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',

  retries: process.env.CI ? 0 : 1,
  timeout: 30_000,

  reporter: process.env.CI
    ? [['html', { open: 'never' }]]
    : [['html', { open: 'on-failure' }]],

  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.2,
    },
  },

  webServer: {
    command: 'cd app && npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },

  projects: [
    {
      name: 'desktop-light',
      use: {
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'light',
      },
    },
    {
      name: 'mobile-light',
      use: {
        ...devices['iPhone 13'],
        colorScheme: 'light',
      },
    },
    {
      name: 'desktop-dark',
      use: {
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'dark',
      },
    },
  ],
});
