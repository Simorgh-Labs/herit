import { defineConfig, devices } from '@playwright/test';

/**
 * E2E suite for the staff app. Boots the real stack, and — because several
 * scenarios assert across both frontends — serves the portal alongside it:
 *  - Herit API in the dedicated E2E environment (test-auth scheme enabled,
 *    SQL Server from appsettings.E2E.json — locally a Docker container on
 *    port 14330, in CI a service container), on :5299,
 *  - the staff app via Vite in `e2e` mode (test-auth MSAL stub enabled), on :5198,
 *  - the expat portal via Vite in `e2e` mode, on :5199, so the cross-app
 *    scenarios (RFP publish, proposal review, takedown cascade, visibility) can
 *    drive an expat/anonymous portal session against the same database.
 *
 * The two SPAs share the localStorage token contract (src/auth/testAuth.ts),
 * so the one token-minting harness signs identities into either origin.
 *
 * See docs/frontend/staff/e2e-testing.md for the auth strategy and local setup.
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
    baseURL: 'http://localhost:5198',
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
      command: 'npx vite --mode e2e --port 5198 --strictPort',
      url: 'http://localhost:5198',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npx vite --mode e2e --port 5199 --strictPort',
      cwd: '../portal',
      url: 'http://localhost:5199',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
