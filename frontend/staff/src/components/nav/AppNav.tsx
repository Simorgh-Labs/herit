import { NavLink } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { msalInstance } from '../../api/client';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { isAdminRole, roleLabel } from '../../types';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-neutral-400 hover:text-white'}`;

export default function AppNav() {
  useMsal();
  const { user } = useCurrentUser();
  const isAdmin = !!user && isAdminRole(user.role);

  const displayName = user?.fullName ?? 'Account';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = () => {
    msalInstance.logoutRedirect({ postLogoutRedirectUri: '/' });
  };

  return (
    <header className="bg-neutral-900 h-16 flex items-center justify-between px-6 shadow-nav">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-md bg-brand text-white flex items-center justify-center font-bold text-lg">
            H
          </span>
          <span className="font-bold text-lg text-white">Herit</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-300 bg-brand-500/25 border border-brand-500 rounded px-1.5 py-0.5">
            Staff
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/rfps" className={navLinkClass}>
            RFPs
          </NavLink>
          <NavLink to="/proposals" className={navLinkClass}>
            Proposals
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/organisations" className={navLinkClass}>
                Organisations
              </NavLink>
              <NavLink to="/users" className={navLinkClass}>
                Users
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3.5">
        <span className="w-[34px] h-[34px] rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-semibold text-sm">
          {initials}
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-white">{displayName}</span>
          {user && <span className="text-[11px] text-neutral-400">{roleLabel(user.role)}</span>}
        </div>
        <button
          onClick={handleSignOut}
          className="ml-1.5 text-neutral-400 hover:text-white transition-colors"
          title="Sign out"
          aria-label="Sign out"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
