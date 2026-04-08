import { Outlet } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import PublicNav from '../nav/PublicNav';
import AuthenticatedNav from '../nav/AuthenticatedNav';

export default function PublicLayout() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated ? <AuthenticatedNav /> : <PublicNav />}
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 py-6 px-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Herit. All rights reserved.
      </footer>
    </div>
  );
}
