import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// CI/azd provides per-app values under app-specific names (VITE_STAFF_*); the code
// reads generic names (VITE_AZURE_CLIENT_ID / VITE_REDIRECT_URI). azure.yaml's
// `env:` blocks are NOT honored by azd, so the rename must happen here. Only applied
// when the CI var is set, so local dev via .env.local is unaffected.
const ciDefines: Record<string, string> = {};
if (process.env.VITE_STAFF_AZURE_CLIENT_ID) {
  ciDefines['import.meta.env.VITE_AZURE_CLIENT_ID'] = JSON.stringify(
    process.env.VITE_STAFF_AZURE_CLIENT_ID,
  );
}
if (process.env.VITE_STAFF_REDIRECT_URI) {
  ciDefines['import.meta.env.VITE_REDIRECT_URI'] = JSON.stringify(
    process.env.VITE_STAFF_REDIRECT_URI,
  );
}

export default defineConfig({
  plugins: [react()],
  define: ciDefines,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    // Playwright E2E specs live in e2e/ and are run by `npm run e2e`, not vitest.
    exclude: ['node_modules/**', 'e2e/**'],
  },
});
