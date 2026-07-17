import { createBrowserRouter } from 'react-router-dom';

import SignInPage from '../pages/auth/SignInPage';
import AccessDeniedPage from '../pages/auth/AccessDeniedPage';
import AuthErrorPage from '../pages/auth/AuthErrorPage';
import DashboardPage from '../pages/app/DashboardPage';
import RfpsPage from '../pages/app/RfpsPage';
import ProposalsPage from '../pages/app/ProposalsPage';
import OrganisationsPage from '../pages/app/OrganisationsPage';
import UsersPage from '../pages/app/UsersPage';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/sign-in', element: <SignInPage /> },
  { path: '/access-denied', element: <AccessDeniedPage /> },
  { path: '/auth/error', element: <AuthErrorPage /> },

  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/rfps', element: <RfpsPage /> },
      { path: '/proposals', element: <ProposalsPage /> },
      { path: '/organisations', element: <OrganisationsPage /> },
      { path: '/users', element: <UsersPage /> },
    ],
  },
]);
