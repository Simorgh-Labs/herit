import { Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const { user, isLoading, isNotFound } = useCurrentUser();

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

  return <>{children}</>;
}
