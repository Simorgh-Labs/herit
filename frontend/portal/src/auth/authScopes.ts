// Both SPAs request the API's delegated scope. The portal has its own MSAL
// client id (VITE_AZURE_CLIENT_ID), but the scope is always minted against the
// shared API registration (VITE_AZURE_API_CLIENT_ID), so we build it here rather
// than reading a full scope string from env.
export const apiScopes = [`api://${import.meta.env.VITE_AZURE_API_CLIENT_ID}/access_as_user`];
