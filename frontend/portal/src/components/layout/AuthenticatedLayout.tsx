import { Outlet } from 'react-router-dom';
import AuthenticatedNav from '../nav/AuthenticatedNav';

export default function AuthenticatedLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AuthenticatedNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
