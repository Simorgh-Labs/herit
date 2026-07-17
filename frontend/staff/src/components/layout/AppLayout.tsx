import { Outlet } from 'react-router-dom';
import AppNav from '../nav/AppNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans antialiased">
      <AppNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
