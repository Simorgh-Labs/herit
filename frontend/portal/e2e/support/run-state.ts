import fs from 'node:fs';
import { RUN_FILE, STATE_DIR, WEB_URL, storageStatePath } from './config';

export interface TestIdentity {
  email: string;
  name: string;
  externalId: string;
  token: string;
}

export interface RunState {
  runId: string;
  rootOrgId: string;
  rootOrgName: string;
  childOrgId: string;
  childOrgName: string;
  rfpId: string;
  rfpTitle: string;
  staffUserId: string;
  identities: {
    superAdmin: TestIdentity;
    staff: TestIdentity;
    /** Registered expat — proposal owner in most specs. */
    userA: TestIdentity;
    /** Registered expat — contributor. */
    userB: TestIdentity;
    /** NOT registered; scenario 1 exercises the first-time JIT flow with it. */
    userA1: TestIdentity;
  };
}

export function writeRunState(state: RunState): void {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(RUN_FILE, JSON.stringify(state, null, 2));
}

export function readRunState(): RunState {
  return JSON.parse(fs.readFileSync(RUN_FILE, 'utf8')) as RunState;
}

/** localStorage payload the app's test-auth MSAL stub reads (see src/auth/testAuth.ts). */
const identityPayload = (identity: TestIdentity): string =>
  JSON.stringify({
    token: identity.token,
    account: { externalId: identity.externalId, email: identity.email, name: identity.name },
  });

/**
 * Writes a Playwright storageState file whose localStorage signs the identity
 * in (key `herit.e2e.auth`), or — with `pending: true` — stages it so the next
 * loginRedirect() call signs it in (key `herit.e2e.pendingAuth`), which lets
 * tests drive the sign-in UI itself.
 */
export function writeStorageState(name: string, identity: TestIdentity, options?: { pending?: boolean }): string {
  const key = options?.pending ? 'herit.e2e.pendingAuth' : 'herit.e2e.auth';
  const statePath = storageStatePath(name);
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify({
    cookies: [],
    origins: [{ origin: WEB_URL, localStorage: [{ name: key, value: identityPayload(identity) }] }],
  }, null, 2));
  return statePath;
}
