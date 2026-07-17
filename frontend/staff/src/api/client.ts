import axios from 'axios';
import { PublicClientApplication, type IPublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../auth/msalConfig';
import { apiScopes } from '../auth/authScopes';
import { createTestMsalInstance } from '../auth/testAuth';

// The E2E branch is statically false outside the `e2e` Vite mode, so production
// builds tree-shake the test-auth stub away entirely.
const msalInstance: IPublicClientApplication =
  import.meta.env.VITE_E2E_AUTH === 'true'
    ? createTestMsalInstance()
    : new PublicClientApplication(msalConfig);

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every request if an account is signed in
apiClient.interceptors.request.use(async (config) => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    try {
      const result = await msalInstance.acquireTokenSilent({
        scopes: apiScopes,
        account: accounts[0],
      });
      config.headers.Authorization = `Bearer ${result.accessToken}`;
    } catch {
      // Token refresh failed — continue without auth header.
    }
  }
  return config;
});

export { msalInstance };
