import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** The staff app under test. */
export const STAFF_PORT = 5198;
/** The expat portal, served alongside for the cross-app scenarios. */
export const PORTAL_PORT = 5199;
export const API_PORT = 5299;

export const STAFF_URL = `http://localhost:${STAFF_PORT}`;
export const PORTAL_URL = `http://localhost:${PORTAL_PORT}`;
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

/**
 * Storage states are origin-scoped: the fake MSAL stub reads its token from the
 * localStorage of whichever app it runs in, so a `staff` state signs an identity
 * into the staff origin and a `portal` state into the portal origin.
 */
export type AppOrigin = 'staff' | 'portal';

export const originUrl = (app: AppOrigin): string => (app === 'portal' ? PORTAL_URL : STAFF_URL);

export const storageStatePath = (name: string): string => path.join(STATE_DIR, `${name}.storage.json`);
