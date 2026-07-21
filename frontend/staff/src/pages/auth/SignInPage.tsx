import { Navigate } from 'react-router-dom';
import { InteractionStatus } from '@azure/msal-browser';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { apiScopes } from '../../auth/authScopes';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL ?? 'https://herit.app';

export default function SignInPage() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  // MSAL's default navigateToLoginRequestUrl returns the user to this page
  // after a successful sign-in; send authenticated users into the app instead
  // of re-rendering the sign-in card.
  if (inProgress !== InteractionStatus.None) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSignIn = async () => {
    try {
      await instance.loginRedirect({ scopes: apiScopes });
    } catch (error) {
      console.error('[Herit Staff] loginRedirect failed:', error);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans antialiased relative overflow-hidden">
      <div className="w-full max-w-[400px] mx-auto px-6 flex flex-col items-center relative z-10">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Herit</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-300 bg-brand-500/25 border border-brand-500 rounded-full px-2.5 py-1">
            Staff
          </span>
        </div>

        {/* Card */}
        <div className="bg-neutral-0 w-full rounded-xl shadow-floating p-8 flex flex-col items-center text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Sign in to Herit Staff</h1>
          <p className="text-sm text-neutral-500 mb-6">
            Staff and admin access only. Sign in with the email and password of the account
            provisioned for you.
          </p>

          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-600 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            Sign in
          </button>

          <p className="text-xs text-neutral-400 mt-4">
            First time here, or forgot your password? Choose &ldquo;Forgot password?&rdquo; on the
            sign-in screen to set a new one.
          </p>

          <p className="text-xs text-neutral-400 mt-6">
            There is no sign-up here — staff and admin accounts are provisioned by an administrator.
          </p>
        </div>

        <a href={PORTAL_URL} className="mt-8 text-sm text-brand-300 hover:underline">
          Looking for the public portal? Go to the Herit Portal
        </a>
      </div>
    </main>
  );
}
