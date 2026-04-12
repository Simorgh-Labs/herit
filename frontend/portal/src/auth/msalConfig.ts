import { Configuration, LogLevel } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://${import.meta.env.VITE_AZURE_TENANT_NAME}.ciamlogin.com/${import.meta.env.VITE_AZURE_TENANT_NAME}.onmicrosoft.com/`,
    knownAuthorities: [`${import.meta.env.VITE_AZURE_TENANT_NAME}.ciamlogin.com`],
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
    postLogoutRedirectUri: '/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
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
