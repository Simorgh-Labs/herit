import { Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { apiScopes } from '../../auth/authScopes';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function SignInPage() {
  const { instance } = useMsal();

  const handleSignIn = async () => {
    try {
      await instance.loginRedirect({ scopes: apiScopes, domainHint: 'google.com', prompt: 'login' });
    } catch (error) {
      console.error('[Herit] loginRedirect failed:', error);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-[1000px] bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px]">
        {/* Left Branding */}
        <div className="w-full md:w-1/2 bg-brand p-10 flex flex-col justify-between relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 150%, rgba(255,255,255,0.8) 0%, transparent 50%), radial-gradient(circle at 80% -50%, rgba(255,255,255,0.8) 0%, transparent 50%)',
            }}
          />
          <div className="z-10 flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Herit</span>
          </div>
          <div className="z-10 mt-12 md:mt-0">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Civic Engagement,<br />Simplified.
            </h1>
            <p className="text-blue-100 text-lg max-w-md">
              Connect with government RFPs, propose community initiatives, and find impactful volunteer roles.
            </p>
          </div>
        </div>

        {/* Right Auth Section */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Sign in to Herit</h2>
              <p className="text-gray-500 text-sm">
                Secure authentication via Google to express interest in roles or submit proposals.
              </p>
            </div>
            <div className="space-y-6">
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-gray-200 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all shadow-sm"
              >
                <GoogleIcon />
                Sign in with Google
              </button>
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-200" />
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>
              <Link
                to="/"
                className="block w-full text-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to browsing
              </Link>
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center px-8">
            <p className="text-xs text-gray-400">
              By signing in, you agree to our{' '}
              <a href="#" className="underline hover:text-gray-900">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-gray-900">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
