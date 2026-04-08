import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMsal } from '@azure/msal-react';
import { listRfps } from '../../api/rfps';
import { listOrganisations } from '../../api/organisations';
import { apiScopes } from '../../auth/authScopes';
import RfpCard from '../../components/RfpCard';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function HomePage() {
  const { instance } = useMsal();

  // TODO: replace with server-side filtering once backend supports query parameters
  const { data: rfps } = useQuery({
    queryKey: ['rfps'],
    queryFn: listRfps,
    select: (data) => data.filter((rfp) => rfp.status === 'Published').slice(0, 3),
  });

  const { data: orgs } = useQuery({
    queryKey: ['organisations'],
    queryFn: listOrganisations,
  });

  const orgMap = Object.fromEntries((orgs ?? []).map((o) => [o.id, o.name]));

  const handleSignIn = async () => {
    try {
      await instance.loginRedirect({ scopes: apiScopes });
    } catch (error) {
      console.error('[Herit] loginRedirect failed:', error);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl mx-auto leading-tight">
            Empowering diaspora to build a smarter, stronger homeland.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            A dedicated platform connecting skilled expats with government RFPs, community proposals, and vital volunteer roles. Your expertise, deployed where it matters most.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/rfps"
              className="w-full sm:w-auto px-8 py-3.5 bg-brand text-white text-base font-semibold rounded-full hover:bg-brand-dark transition-colors shadow-lg shadow-brand/30"
            >
              Browse RFPs
            </Link>
            <Link
              to="/proposals"
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-100 text-gray-900 text-base font-semibold rounded-full hover:bg-gray-200 transition-colors"
            >
              Explore Proposals
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-gray-200 bg-gray-50/50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-200">
            <div className="text-center px-4">
              <p className="text-4xl font-bold text-gray-900 mb-2">1,204</p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active RFPs</p>
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-bold text-gray-900 mb-2">850+</p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Public Proposals</p>
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-bold text-gray-900 mb-2">3.2k</p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Volunteer Roles</p>
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-bold text-gray-900 mb-2">45</p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Gov Departments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest RFPs */}
      {rfps && rfps.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Latest Opportunities</h2>
              <Link to="/rfps" className="text-brand font-medium hover:underline flex items-center gap-2 text-sm">
                View all RFPs
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rfps.map((rfp) => (
                <RfpCard key={rfp.id} rfp={rfp} orgName={orgMap[rfp.organisationId]} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">How Herit Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">A streamlined process connecting your expertise with national needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-brand/20 via-brand/40 to-brand/20" />
            {[
              {
                step: '1',
                icon: (
                  <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'Discover',
                desc: 'Browse active government RFPs, community proposals, and specific volunteer roles that match your professional background.',
              },
              {
                step: '2',
                icon: (
                  <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Sign In & Engage',
                desc: 'Securely authenticate with Google to unlock the ability to submit proposals, express interest, or comment on public initiatives.',
              },
              {
                step: '3',
                icon: (
                  <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Contribute',
                desc: 'Collaborate directly with departments, track your submissions, and make a tangible impact on national development.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-gray-100 shadow-sm flex items-center justify-center mb-6 z-10 relative">
                  {icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                    {step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign-in Nudge */}
      <section className="py-24 bg-white">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="bg-gray-900 rounded-[2rem] p-10 md:p-16 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-brand/20 to-transparent opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/10">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Ready to make an impact?</h2>
              <p className="text-gray-300 text-lg mb-10 max-w-lg mx-auto">
                Sign in to submit proposals, apply for roles, and track your civic contributions.
              </p>
              <button
                onClick={handleSignIn}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-900 text-base font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <p className="text-sm text-gray-500 mt-6">Secure authentication. No password required.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
