import { createBrowserRouter } from 'react-router-dom';

// Public pages
import HomePage from '../pages/public/HomePage';
import RfpListPage from '../pages/public/RfpListPage';
import RfpDetailPage from '../pages/public/RfpDetailPage';
import ProposalListPage from '../pages/public/ProposalListPage';
import ProposalDetailPage from '../pages/public/ProposalDetailPage';
import CfeoiDirectoryPage from '../pages/public/CfeoiDirectoryPage';
import CfeoiDetailPage from '../pages/public/CfeoiDetailPage';
import SignInPage from '../pages/public/SignInPage';

// Auth flow pages
import AuthLoadingPage from '../pages/auth/AuthLoadingPage';
import AuthErrorPage from '../pages/auth/AuthErrorPage';
import CompleteProfilePage from '../pages/auth/CompleteProfilePage';

// App pages (protected)
import DashboardPage from '../pages/app/DashboardPage';
import CreateProposalPage from '../pages/app/CreateProposalPage';
import MyProposalsPage from '../pages/app/MyProposalsPage';
import MyEoisPage from '../pages/app/MyEoisPage';
import CfeoiEoiInboxPage from '../pages/app/CfeoiEoiInboxPage';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  // Public shell
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/rfps', element: <RfpListPage /> },
      { path: '/rfps/:rfpId', element: <RfpDetailPage /> },
      { path: '/proposals', element: <ProposalListPage /> },
      { path: '/proposals/:proposalId', element: <ProposalDetailPage /> },
      { path: '/cfeois', element: <CfeoiDirectoryPage /> },
      { path: '/cfeois/:cfeoiId', element: <CfeoiDetailPage /> },
      { path: '/sign-in', element: <SignInPage /> },
    ],
  },

  // Auth flow — no layout wrapper
  { path: '/auth/loading', element: <AuthLoadingPage /> },
  { path: '/auth/error', element: <AuthErrorPage /> },
  { path: '/auth/complete-profile', element: <CompleteProfilePage /> },

  // Protected shell
  {
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/my-proposals', element: <MyProposalsPage /> },
      { path: '/proposals/new', element: <CreateProposalPage /> },
      { path: '/my-eois', element: <MyEoisPage /> },
      { path: '/cfeois/:cfeoiId/eois', element: <CfeoiEoiInboxPage /> },
    ],
  },
]);
