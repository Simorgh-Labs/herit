import { defineConfig, devices } from '@playwright/test';

/**
 * E2E suite for the expat portal. Boots the real stack:
 *  - Herit API in the dedicated E2E environment (test-auth scheme enabled,
 *    SQL Server from appsettings.E2E.json — locally a Docker container on
 *    port 14330, in CI a service container),
 *  - the portal via Vite in `e2e` mode (test-auth MSAL stub enabled).
 *
 * See docs/frontend/portal/e2e-testing.md for the auth strategy and local setup.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  // Specs share one database and one seeded baseline; run serially.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'e2e/.report' }]]
    : [['list']],
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      teardown: 'cleanup',
    },
    {
      name: 'cleanup',
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      command: 'dotnet run --no-launch-profile --project ../../src/Herit.Api',
      url: 'http://localhost:5299/api/v1/Organisations',
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      env: {
        ASPNETCORE_ENVIRONMENT: 'E2E',
        ASPNETCORE_URLS: 'http://localhost:5299',
      },
    },
    {
      command: 'npx vite --mode e2e --port 5199 --strictPort',
      url: 'http://localhost:5199',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
