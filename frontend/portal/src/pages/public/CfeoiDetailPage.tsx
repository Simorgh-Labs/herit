import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { getCfeoiById } from '../../api/cfeois';
import { getProposalById } from '../../api/proposals';
import { apiScopes } from '../../auth/authScopes';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import SidebarCard from '../../components/SidebarCard';

/** Sign In modal shown when unauthenticated user tries to express interest */
function SignInModal({ onClose }: { onClose: () => void }) {
  const { instance } = useMsal();

  const handleSignIn = async () => {
    try {
      await instance.loginRedirect({ scopes: apiScopes });
    } catch (error) {
      console.error('[Herit] loginRedirect failed:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg flex flex-col overflow-hidden">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-5 ring-8 ring-blue-50/50">
            <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="mb-8">
            <h2 id="signin-modal-title" className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mx-auto">
              To express interest in volunteer roles or submit proposals, you need to sign in with your Google account.
            </p>
          </div>
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
              </svg>
              Sign in with Google
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Continue browsing
            </button>
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Secure authentication via Google Workspace.<br />We do not post on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CfeoiDetailPage() {
  const { cfeoiId } = useParams<{ cfeoiId: string }>();
  const isAuthenticated = useIsAuthenticated();
  const [showSignInModal, setShowSignInModal] = useState(false);

  const { data: cfeoi, isLoading, isError } = useQuery({
    queryKey: ['cfeois', cfeoiId],
    queryFn: () => getCfeoiById(cfeoiId!),
    enabled: !!cfeoiId,
  });

  const { data: proposal } = useQuery({
    queryKey: ['proposals', cfeoi?.proposalId],
    queryFn: () => getProposalById(cfeoi!.proposalId),
    enabled: !!cfeoi?.proposalId,
  });

  if (isLoading) return <LoadingSpinner className="py-32" />;

  if (isError || !cfeoi) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity not found</h2>
        <p className="text-gray-600 mb-6">This opportunity may have been removed or is no longer available.</p>
        <Link to="/cfeois" className="text-brand hover:underline font-medium">← Back to CFEOI Directory</Link>
      </div>
    );
  }

  return (
    <div className="w-full pb-16 bg-gray-50">
      {showSignInModal && <SignInModal onClose={() => setShowSignInModal(false)} />}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1200px] mx-auto px-6">
          <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li><Link to="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <Link to="/cfeois" className="hover:text-brand transition-colors">CFEOI Directory</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">{cfeoi.title}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Column */}
          <div className="w-full lg:w-[70%]">
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <StatusBadge type="cfeoi" status={cfeoi.status} />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{cfeoi.title}</h1>

              <div className="prose prose-blue max-w-none text-gray-600">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Role Overview</h2>
                <p className="mb-8 leading-relaxed">{cfeoi.description}</p>

                {cfeoi.tags && (() => {
                  const tags = cfeoi.tags.split(',').map((t) => t.trim()).filter(Boolean);
                  return tags.length > 0 ? (
                    <>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Tags</h2>
                      <div className="flex flex-wrap gap-3 mb-8">
                        {tags.map((tag) => (
                          <span key={tag} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            </div>
          </div>

          {/* Right Sidebar Action */}
          <div className="w-full lg:w-[30%]">
            <SidebarCard className="sticky top-24">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Express Interest</h3>
                <p className="text-sm text-gray-500">
                  {isAuthenticated
                    ? 'Connect with the project team and formally express your interest in this volunteer role.'
                    : 'Sign in to connect with the project team and formally express your interest in this volunteer role.'}
                </p>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    // TODO: implement EOI submission modal — see Flow 3e
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand text-white font-medium rounded-lg hover:bg-brand-dark transition-colors mb-4"
                >
                  Express Interest
                </button>
              ) : (
                <button
                  onClick={() => setShowSignInModal(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand text-white font-medium rounded-lg hover:bg-brand-dark transition-colors mb-4"
                >
                  Sign In to Express Interest
                </button>
              )}

              <p className="text-xs text-center text-gray-400 mb-6">
                Secure authentication via Google Workspace. We do not post on your behalf.
              </p>

              {proposal && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Related Context
                  </h4>
                  <Link
                    to={`/proposals/${proposal.id}`}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-brand hover:bg-blue-50 transition-colors group"
                  >
                    <span className="text-xs text-gray-500 block mb-1">Parent Proposal</span>
                    <span className="text-sm font-medium text-brand group-hover:underline flex items-center justify-between">
                      {proposal.title}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </div>
              )}
            </SidebarCard>
          </div>
        </div>
      </div>
    </div>
  );
}
