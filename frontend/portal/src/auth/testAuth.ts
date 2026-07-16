/**
 * Test-only MSAL replacement for the Playwright E2E suite.
 *
 * When the app is built/served with VITE_E2E_AUTH=true (the `e2e` Vite mode),
 * `client.ts` swaps the real PublicClientApplication for the fake returned by
 * `createTestMsalInstance`. The fake reads a pre-minted API token and account
 * details from localStorage (written by Playwright via storageState), so the
 * rest of the app — MsalProvider, useIsAuthenticated, the axios interceptor —
 * runs unchanged. Production builds never set VITE_E2E_AUTH, the conditional
 * is statically false, and this module is tree-shaken out of the bundle; the
 * API additionally refuses test tokens outside the E2E environment.
 *
 * localStorage contract (shared with frontend/portal/e2e):
 * - `herit.e2e.auth`        — the signed-in identity: `{ token, account: { externalId, email, name } }`
 * - `herit.e2e.pendingAuth` — identity that a call to loginRedirect() will sign
 *                             in, simulating the Entra redirect round-trip.
 * - `herit.e2e.loginRequested` — marker written whenever loginRedirect() is
 *                             called, so tests can assert sign-in was prompted.
 */
import {
  EventType,
  InteractionType,
  Logger,
  LogLevel,
  type AccountInfo,
  type AuthenticationResult,
  type EventCallbackFunction,
  type EventMessage,
  type IPublicClientApplication,
} from '@azure/msal-browser';

const AUTH_KEY = 'herit.e2e.auth';
const PENDING_AUTH_KEY = 'herit.e2e.pendingAuth';
const LOGIN_REQUESTED_KEY = 'herit.e2e.loginRequested';

interface TestIdentity {
  token: string;
  account: {
    externalId: string;
    email: string;
    name: string;
  };
}

function readIdentity(key: string): TestIdentity | null {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TestIdentity;
  } catch {
    return null;
  }
}

function toAccountInfo(identity: TestIdentity): AccountInfo {
  return {
    homeAccountId: `${identity.account.externalId}.e2e`,
    environment: 'e2e.local',
    tenantId: 'e2e',
    username: identity.account.email,
    localAccountId: identity.account.externalId,
    name: identity.account.name,
  };
}

export function createTestMsalInstance(): IPublicClientApplication {
  const eventCallbacks = new Map<string, EventCallbackFunction>();
  let nextCallbackId = 0;

  const emit = (eventType: EventType, payload: unknown = null) => {
    const message: EventMessage = {
      eventType,
      interactionType: InteractionType.Redirect,
      payload: payload as EventMessage['payload'],
      error: null,
      timestamp: Date.now(),
    };
    eventCallbacks.forEach((callback) => callback(message));
  };

  const getAccounts = (): AccountInfo[] => {
    const identity = readIdentity(AUTH_KEY);
    return identity ? [toAccountInfo(identity)] : [];
  };

  const fake = {
    initialize: () => Promise.resolve(),
    initializeWrapperLibrary: () => undefined,
    handleRedirectPromise: () => Promise.resolve(null),

    getLogger: () => new Logger({ loggerCallback: () => undefined, logLevel: LogLevel.Error }),
    setLogger: () => undefined,

    getAllAccounts: getAccounts,
    getActiveAccount: () => getAccounts()[0] ?? null,
    setActiveAccount: () => undefined,
    getAccount: () => getAccounts()[0] ?? null,
    getAccountByHomeId: () => getAccounts()[0] ?? null,
    getAccountByLocalId: () => getAccounts()[0] ?? null,
    getAccountByUsername: () => getAccounts()[0] ?? null,

    addEventCallback: (callback: EventCallbackFunction) => {
      const id = `e2e-callback-${nextCallbackId++}`;
      eventCallbacks.set(id, callback);
      return id;
    },
    removeEventCallback: (callbackId: string) => {
      eventCallbacks.delete(callbackId);
    },
    enableAccountStorageEvents: () => undefined,
    disableAccountStorageEvents: () => undefined,

    acquireTokenSilent: (): Promise<AuthenticationResult> => {
      const identity = readIdentity(AUTH_KEY);
      if (!identity) return Promise.reject(new Error('E2E test auth: no signed-in identity.'));
      return Promise.resolve({
        accessToken: identity.token,
        account: toAccountInfo(identity),
        idToken: identity.token,
        scopes: [],
      } as unknown as AuthenticationResult);
    },

    loginRedirect: (request?: { scopes?: string[] }): Promise<void> => {
      window.sessionStorage.setItem(
        LOGIN_REQUESTED_KEY,
        JSON.stringify({ scopes: request?.scopes ?? [], timestamp: Date.now() }),
      );
      const pending = readIdentity(PENDING_AUTH_KEY);
      if (!pending) {
        // No identity staged: record the attempt (asserted by tests) and stay put.
        console.warn('[Herit E2E] loginRedirect called with no pending identity staged.');
        return Promise.resolve();
      }
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(pending));
      window.localStorage.removeItem(PENDING_AUTH_KEY);
      emit(EventType.LOGIN_SUCCESS, { account: toAccountInfo(pending) });
      // Reload the current page: MSAL's redirect flow returns the user to the
      // page that initiated the login (navigateToLoginRequestUrl default).
      window.location.reload();
      return Promise.resolve();
    },

    logoutRedirect: (request?: { postLogoutRedirectUri?: string | null }): Promise<void> => {
      window.localStorage.removeItem(AUTH_KEY);
      emit(EventType.LOGOUT_SUCCESS);
      window.location.assign(request?.postLogoutRedirectUri ?? '/');
      return Promise.resolve();
    },
  };

  return fake as unknown as IPublicClientApplication;
}
