import { Navigate } from 'react-router-dom';
import { InteractionStatus } from '@azure/msal-browser';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { isStaffRole } from '../types';

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
}

// Role gate (spec §1): a User record must exist with role Staff/OrganisationAdmin/
// SuperAdmin. No record (404) or role Expat both mean access-denied — staff/admin
// accounts are provisioned, never JIT-registered (ADR-015), so there is no
// "complete profile" branch here the way the portal has.
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const { user, isLoading, isNotFound, error } = useCurrentUser();

  if (inProgress !== InteractionStatus.None) return null;
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;
  if (isLoading) return null;

  if (isNotFound || (user && !isStaffRole(user.role))) {
    return <Navigate to="/access-denied" replace />;
  }
  if (error) return <Navigate to="/auth/error" replace />;

  return <>{children}</>;
}
