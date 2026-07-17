import fs from 'node:fs';
import { originUrl, RUN_FILE, STATE_DIR, storageStatePath, type AppOrigin } from './config';

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
  /** The org admin's own User id — for asserting the self-delete backstop. */
  orgAdminUserId: string;
  /** The seeded staff user's id. */
  staffUserId: string;
  identities: {
    superAdmin: TestIdentity;
    /** OrganisationAdmin — drives the admin-only staff UI (orgs, users). */
    orgAdmin: TestIdentity;
    /** Plain Staff — admin nav/routes must be denied to it. */
    staff: TestIdentity;
    /** Registered expat — proposal owner and cross-app portal actor. */
    expat: TestIdentity;
    /** Registered expat — EOI contributor for the takedown/review scenarios. */
    expatB: TestIdentity;
    /** Registered expat — a second EOI submitter (API-only). */
    expatC: TestIdentity;
    /** NOT provisioned in the staff app (role Expat) — hits the access gate. */
    /** Never registered at all — first-time JIT 404 hits the access gate too. */
    unprovisioned: TestIdentity;
  };
}

export function writeRunState(state: RunState): void {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(RUN_FILE, JSON.stringify(state, null, 2));
}

export function readRunState(): RunState {
  return JSON.parse(fs.readFileSync(RUN_FILE, 'utf8')) as RunState;
}

/** localStorage payload the apps' test-auth MSAL stub reads (see src/auth/testAuth.ts). */
const identityPayload = (identity: TestIdentity): string =>
  JSON.stringify({
    token: identity.token,
    account: { externalId: identity.externalId, email: identity.email, name: identity.name },
  });

/**
 * Writes a Playwright storageState file whose localStorage signs the identity
 * into the given app origin (key `herit.e2e.auth`), or — with `pending: true` —
 * stages it so the next loginRedirect() call signs it in (key
 * `herit.e2e.pendingAuth`), which lets a test drive the sign-in UI itself.
 */
export function writeStorageState(
  name: string,
  app: AppOrigin,
  identity: TestIdentity,
  options?: { pending?: boolean },
): string {
  const key = options?.pending ? 'herit.e2e.pendingAuth' : 'herit.e2e.auth';
  const statePath = storageStatePath(name);
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify({
    cookies: [],
    origins: [{ origin: originUrl(app), localStorage: [{ name: key, value: identityPayload(identity) }] }],
  }, null, 2));
  return statePath;
}
