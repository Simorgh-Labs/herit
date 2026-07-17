import { useMsal } from '@azure/msal-react';
import { apiScopes } from '../../auth/authScopes';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL ?? 'https://herit.app';

export default function SignInPage() {
  const { instance } = useMsal();

  const handleSignIn = async () => {
    try {
      await instance.loginRedirect({ scopes: apiScopes, domainHint: 'google.com', prompt: 'login' });
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
            Staff and admin access only. Sign in with the Entra work account provisioned for you.
          </p>

          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3.01c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11A12 12 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.99-3.11z"
              />
              <path
                fill="#EA4335"
                d="M12 4.76c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l3.99 3.11C6.22 6.87 8.87 4.76 12 4.76z"
              />
            </svg>
            Continue with Google
          </button>

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
