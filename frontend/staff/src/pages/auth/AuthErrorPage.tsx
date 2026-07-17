export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center font-sans antialiased">
      <div className="w-full max-w-[440px] mx-auto px-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-3">Something went wrong</h1>
        <p className="text-sm text-neutral-500">
          We couldn't load your account. Try refreshing the page, or contact an administrator if this continues.
        </p>
      </div>
    </main>
  );
}
