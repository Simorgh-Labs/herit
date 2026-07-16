import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const WEB_PORT = 5199;
export const API_PORT = 5299;
export const WEB_URL = `http://localhost:${WEB_PORT}`;
export const API_HOST = `http://localhost:${API_PORT}`;

/** Must match TestAuth settings in src/Herit.Api/appsettings.E2E.json. */
export const SIGNING_KEY = 'herit-e2e-signing-key-not-a-secret-0123456789abcdef0123456789abcdef';
export const TOKEN_ISSUER = 'https://herit-e2e.local';
export const TOKEN_AUDIENCE = 'herit-api-e2e';

export const SUPER_ADMIN_EMAIL = 'superadmin@e2e.herit.local';
export const SUPER_ADMIN_NAME = 'E2E Super Admin';

export const REPO_ROOT = path.resolve(here, '../../../..');
export const API_PROJECT = path.join(REPO_ROOT, 'src/Herit.Api');

/** Per-run artifacts (storage states, run metadata). Gitignored. */
export const STATE_DIR = path.resolve(here, '../.state');
export const RUN_FILE = path.join(STATE_DIR, 'run.json');

export const storageStatePath = (name: string): string => path.join(STATE_DIR, `${name}.storage.json`);
