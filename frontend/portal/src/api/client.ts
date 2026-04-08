import axios from 'axios';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../auth/msalConfig';
import { apiScopes } from '../auth/authScopes';

const msalInstance = new PublicClientApplication(msalConfig);

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
      // Token refresh failed — continue without auth header (public endpoints will still work)
    }
  }
  return config;
});

export { msalInstance };
