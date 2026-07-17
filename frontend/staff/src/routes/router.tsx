import { createBrowserRouter } from 'react-router-dom';

import SignInPage from '../pages/auth/SignInPage';
import AccessDeniedPage from '../pages/auth/AccessDeniedPage';
import AuthErrorPage from '../pages/auth/AuthErrorPage';
import DashboardPage from '../pages/app/DashboardPage';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/sign-in', element: <SignInPage /> },
  { path: '/access-denied', element: <AccessDeniedPage /> },
  { path: '/auth/error', element: <AuthErrorPage /> },

  {
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
    path: '/',
  },
]);
