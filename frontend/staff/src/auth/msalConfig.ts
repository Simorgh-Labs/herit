import { Configuration, LogLevel } from '@azure/msal-browser';

const authority: string = import.meta.env.VITE_AZURE_AUTHORITY;
// Extract the hostname (e.g. "heritdomain.ciamlogin.com") so MSAL knows to trust
// this non-standard authority domain during endpoint discovery.
const authorityHost = new URL(authority).hostname;

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority,
    knownAuthorities: [authorityHost],
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
    postLogoutRedirectUri: '/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (_level, message, containsPii) => {
        if (containsPii) return;
        if (import.meta.env.DEV) console.log(`[MSAL] ${message}`);
      },
      logLevel: LogLevel.Verbose,
    },
  },
};
