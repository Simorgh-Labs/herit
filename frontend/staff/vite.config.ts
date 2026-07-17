import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    // Playwright E2E specs live in e2e/ and are run by `npm run e2e`, not vitest.
    exclude: ['node_modules/**', 'e2e/**'],
  },
});
