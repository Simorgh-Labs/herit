export default function AuthLoadingPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center font-sans antialiased">
      <div role="status" aria-live="polite" className="text-sm text-neutral-500">
        Signing you in…
      </div>
    </main>
  );
}
