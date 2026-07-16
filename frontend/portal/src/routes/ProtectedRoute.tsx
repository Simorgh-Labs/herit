import { Navigate } from 'react-router-dom';
import { InteractionStatus } from '@azure/msal-browser';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const { user, isLoading, isNotFound, error } = useCurrentUser();

  // useIsAuthenticated reports false until MSAL finishes starting up, so deciding
  // before then would bounce signed-in users to /sign-in on a cold deep-link.
  if (inProgress !== InteractionStatus.None) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (isLoading) {
    return null;
  }

  // 404 means authenticated in Entra but not yet registered in Herit
  if (isNotFound || (user && !user.termsAcceptedAt)) {
    return <Navigate to="/auth/complete-profile" replace />;
  }

  // Any other error (e.g. 422, 500) means we cannot verify the user — send to error page
  if (error) {
    return <Navigate to="/auth/error" replace />;
  }

  return <>{children}</>;
}
