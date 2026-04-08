import { Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const { user, isLoading } = useCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (isLoading) {
    return null;
  }

  if (user && !user.termsAcceptedAt) {
    return <Navigate to="/auth/complete-profile" replace />;
  }

  return <>{children}</>;
}
