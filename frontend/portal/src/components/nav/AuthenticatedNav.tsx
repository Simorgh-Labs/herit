import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { ChevronDown, Plus } from 'lucide-react';
import { msalInstance } from '../../api/client';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const HeritLogo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <div className="w-8 h-8 bg-brand-light rounded-lg flex items-center justify-center border border-blue-200 group-hover:bg-blue-100 transition-colors">
      <span className="text-brand font-bold text-sm">H</span>
    </div>
    <span className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-brand transition-colors">
      Herit
    </span>
  </Link>
);

export default function AuthenticatedNav() {
  const { accounts } = useMsal();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useCurrentUser();

  const displayName = user?.fullName ?? accounts[0]?.name ?? 'Account';
  const avatarInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = () => {
    msalInstance.logoutRedirect({ postLogoutRedirectUri: '/' });
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <HeritLogo />
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/rfps"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            Browse RFPs
          </NavLink>
          <NavLink
            to="/proposals"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            Public Proposals
          </NavLink>
          <NavLink
            to="/cfeois"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            CFEOI Directory
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/proposals/new"
          className="hidden sm:flex bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors items-center gap-2"
        >
          <Plus className="w-3 h-3" />
          Create Proposal
        </Link>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold border-2 border-white shadow-sm">
              {avatarInitials}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{displayName}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  My Dashboard
                </Link>
                <Link
                  to="/my-proposals"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  My Proposals
                </Link>
                <div className="h-px bg-gray-200 my-1" />
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
