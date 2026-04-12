import { useMsal } from '@azure/msal-react';
import { apiScopes } from '../../auth/authScopes';

interface AuthErrorPageProps {
  readonly onRetry?: () => void;
}

export default function AuthErrorPage({ onRetry }: AuthErrorPageProps) {
  const { instance } = useMsal();

  const handleTryAgain = async () => {
    onRetry?.();
    await instance.loginRedirect({ scopes: apiScopes, domainHint: 'google.com' });
  };

  const handleReturnToBrowsing = () => {
    // Use window.location so this works even before the router is mounted
    globalThis.location.href = '/';
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center font-sans antialiased">
      <div className="w-full max-w-md mx-auto px-6 py-12 flex flex-col items-center">

        {/* Brand (outside card) */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center mb-3 shadow-sm border border-brand/10">
            <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 21v-4m0 0h4m-4 0l4-4m14 4v-4m0 4h-4m4 0l-4-4M9 20h6a2 2 0 002-2v-8a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2zm3-4v.01M12 8V7m0-3v.01M4 4h16" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Herit</span>
        </div>

        {/* Card */}
        <div className="bg-white w-full rounded-2xl shadow-lg p-8 md:p-10 flex flex-col items-center text-center border border-gray-200/50 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, #DC2626 0%, transparent 50%)' }} />

          {/* Error icon */}
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6 relative z-10">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 w-full mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">We couldn't sign you in</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              There was an issue connecting to your Google account. Please ensure your credentials are correct or try again.
            </p>
            <p className="text-sm text-gray-500">
              Need assistance?{' '}
              <span className="text-brand font-medium">Visit our Help Center</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-3 relative z-10">
            <button
              onClick={handleTryAgain}
              className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
              Try Again
            </button>
            <button
              onClick={handleReturnToBrowsing}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-xl border border-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
            >
              Return to Browse
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-400 text-center">
          &copy; 2026 Herit Platform. All rights reserved.
        </div>
      </div>
    </main>
  );
}
