import { Link, NavLink } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

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

export default function PublicNav() {
  const { instance } = useMsal();

  const handleSignIn = () => {
    instance.loginRedirect({
      scopes: ['openid', 'profile', 'email'],
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <HeritLogo />
          <nav className="hidden md:flex items-center bg-gray-900 rounded-full px-2 py-1.5">
            <NavLink
              to="/rfps"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                }`
              }
            >
              Browse RFPs
            </NavLink>
            <NavLink
              to="/proposals"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                }`
              }
            >
              Public Proposals
            </NavLink>
            <NavLink
              to="/cfeois"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                }`
              }
            >
              CFEOI Directory
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center">
          <button
            onClick={handleSignIn}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-brand border-2 border-brand rounded-full hover:bg-brand-light transition-colors"
          >
            <GoogleIcon />
            Sign In with Google
          </button>
        </div>
      </div>
    </header>
  );
}
