import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile } from '../../api/users';

export default function CompleteProfilePage() {
  const { accounts } = useMsal();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const account = accounts[0];

  const [fullName, setFullName] = useState(account?.name ?? '');
  const [nationality, setNationality] = useState('');
  const [location, setLocation] = useState('');
  const [expertiseTags, setExpertiseTags] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      updateUserProfile({
        email: (account?.idTokenClaims?.email as string) || account?.username || undefined,
        nationality: nationality || undefined,
        location: location || undefined,
        expertiseTags: expertiseTags || undefined,
        termsAcceptedAt: new Date().toISOString(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/dashboard', { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased">

      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-light rounded-lg flex items-center justify-center border border-brand/10">
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 21v-4m0 0h4m-4 0l4-4m14 4v-4m0 4h-4m4 0l-4-4M9 20h6a2 2 0 002-2v-8a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2zm3-4v.01M12 8V7m0-3v.01M4 4h16" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">Herit</span>
          </div>
          <span className="text-sm font-medium text-gray-500">Profile Setup</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 items-start">

        {/* Form column (2/3) */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-500">Just a few more details to set up your Herit account and connect with civic initiatives.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email — read-only */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={(account?.idTokenClaims?.email as string) ?? account?.username ?? ''}
                      disabled
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Linked from your Google account. This cannot be changed.</p>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Alex Johnson"
                    required
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-shadow"
                  />
                </div>

                {/* Nationality + Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-900 mb-1">
                      Home Country / Nationality{' '}
                      <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
                    </label>
                    <input
                      id="nationality"
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g., Nigeria"
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-900 mb-1">
                      Current Residence{' '}
                      <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., London, UK"
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-shadow"
                    />
                  </div>
                </div>

                {/* Expertise Tags */}
                <div>
                  <label htmlFor="expertiseTags" className="block text-sm font-medium text-gray-900 mb-1">
                    Expertise Tags{' '}
                    <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
                  </label>
                  <input
                    id="expertiseTags"
                    type="text"
                    value={expertiseTags}
                    onChange={(e) => setExpertiseTags(e.target.value)}
                    placeholder="e.g., Urban Planning, Public Health, Tech Policy"
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-shadow"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Separate tags with commas to help match you with relevant proposals.</p>
                </div>

                <hr className="border-gray-200" />

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                  />
                  <div className="text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-900 cursor-pointer">
                      I accept the terms and conditions
                    </label>
                    <p className="text-gray-500 mt-1 text-xs leading-relaxed">
                      By checking this box, you agree to the Herit{' '}
                      <span className="text-brand font-medium">Terms of Service</span>{' '}
                      and acknowledge our{' '}
                      <span className="text-brand font-medium">Privacy Policy</span>.
                    </p>
                  </div>
                </div>

                {mutation.isError && (
                  <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
                )}

                {/* Submit */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={!termsAccepted || mutation.isPending}
                    className="px-8 py-2.5 text-sm font-medium text-white bg-brand rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-dark"
                  >
                    {mutation.isPending ? 'Joining…' : 'Join Herit'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* Info panel (1/3) */}
        <div className="w-full lg:w-1/3">
          <div className="bg-brand-light rounded-2xl p-8 border border-brand/10 flex flex-col items-center text-center justify-center shadow-sm">
            <h3 className="text-xl font-semibold text-brand mb-3">Your Civic Connection</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              Herit bridges the gap between diaspora expertise and national development. By completing your profile, you unlock the ability to engage with critical public sector proposals.
            </p>
            <div className="space-y-4 w-full text-left bg-white/50 p-5 rounded-xl border border-brand/5">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-brand mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Browse RFPs</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Access exclusive government requests.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-brand mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Submit Proposals</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Share your expertise directly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-brand mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Track Impact</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Manage your Expressions of Interest.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>&copy; 2026 Herit Platform. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Support</span>
            <span className="text-gray-200">•</span>
            <span>Help Center</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
