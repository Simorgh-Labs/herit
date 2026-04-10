import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { EventType, InteractionStatus } from '@azure/msal-browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { msalInstance } from './api/client';
import { router } from './routes/router';
import AuthLoadingPage from './pages/auth/AuthLoadingPage';
import AuthErrorPage from './pages/auth/AuthErrorPage';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppShell() {
  const { inProgress } = useMsal();
  const [loginFailed, setLoginFailed] = useState(false);

  useEffect(() => {
    const callbackId = msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_FAILURE) {
        setLoginFailed(true);
      }
    });
    return () => {
      if (callbackId) msalInstance.removeEventCallback(callbackId);
    };
  }, []);

  if (loginFailed) return <AuthErrorPage onRetry={() => setLoginFailed(false)} />;
  if (inProgress === InteractionStatus.HandleRedirect) return <AuthLoadingPage />;

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    </MsalProvider>
  </React.StrictMode>,
);
