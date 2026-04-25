const SPINNER_STYLE = {
  strokeDasharray: 150,
  strokeDashoffset: 40,
  strokeLinecap: 'round' as const,
};

export default function AuthLoadingPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center font-sans antialiased">
      <div className="w-full max-w-md mx-auto px-6 py-12 flex flex-col items-center">

        {/* Card */}
        <div className="bg-white w-full rounded-2xl shadow-lg p-10 flex flex-col items-center text-center border border-gray-200/50 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, #1D4ED8 0%, transparent 50%)' }} />

          {/* Brand */}
          <header className="mb-10 relative z-10">
            <div className="w-16 h-16 mx-auto bg-brand rounded-2xl flex items-center justify-center text-white font-bold text-5xl shadow-sm mb-6">
              H
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Herit</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Civic Engagement Platform</p>
          </header>

          {/* Spinner */}
          <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full text-gray-200" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
            <svg className="absolute inset-0 w-full h-full text-brand animate-spin" viewBox="0 0 50 50"
              style={{ animationDuration: '1.5s' }}>
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4"
                style={SPINNER_STYLE} />
            </svg>
            <div className="w-6 h-6 bg-brand/10 rounded-full animate-pulse" />
          </div>

          {/* Status */}
          <div role="status" aria-live="polite" className="flex flex-col items-center relative z-10 w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Signing you in</h2>
            <p className="text-sm text-gray-500 max-w-[250px] leading-relaxed">
              Securely connecting your Google account to your civic profile…
            </p>
          </div>

          {/* Trust indicator */}
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Encrypted Connection
          </div>
        </div>

        <div className="mt-8 text-center">
          <span className="text-sm text-gray-500 font-medium">
            Having trouble? Visit Help Center
          </span>
        </div>
      </div>
    </main>
  );
}
