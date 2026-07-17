import { useMsal } from '@azure/msal-react';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL ?? 'https://herit.app';

export default function AccessDeniedPage() {
  const { instance } = useMsal();

  const handleSignOut = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: '/' });
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center font-sans antialiased">
      <div className="w-full max-w-[440px] mx-auto px-6">
        <div className="bg-neutral-0 rounded-xl shadow-card border border-neutral-200 p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-status-danger-bg flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-status-danger-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-neutral-900 mb-3">This application is for Herit staff</h1>
          <p className="text-sm text-neutral-500 mb-8">
            Your signed-in account isn't provisioned for staff access. If you believe this is a mistake, contact an
            administrator to be added — this page won't retry automatically.
          </p>

          <div className="w-full flex flex-col gap-3">
            <a
              href={PORTAL_URL}
              className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-3 px-4 rounded-lg transition-colors text-center focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
              Go to the Herit Portal
            </a>
            <button
              onClick={handleSignOut}
              className="w-full text-neutral-700 hover:bg-neutral-100 font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
