import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { getCfeoiById, updateCfeoiStatus } from '../../api/cfeois';
import { getProposalById } from '../../api/proposals';
import { listEoisByCfeoi } from '../../api/eois';
import { apiScopes } from '../../auth/authScopes';
import { useCurrentUser } from '../../hooks/useCurrentUser';
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
  const [searchParams] = useSearchParams();
  const isAuthenticated = useIsAuthenticated();
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeConfirmed, setCloseConfirmed] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(
    searchParams.get('published') === 'true' || searchParams.get('updated') === 'true'
  );
  const successMessage = searchParams.get('updated') === 'true'
    ? 'CFEOI updated successfully.'
    : 'CFEOI published successfully. It is now live and accepting expressions of interest from the diaspora network.';

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

  const isOwner = !!currentUser && !!proposal && currentUser.id === proposal.authorId;

  const { data: eois } = useQuery({
    queryKey: ['eois', 'cfeoi', cfeoiId],
    queryFn: () => listEoisByCfeoi(cfeoiId!),
    enabled: isOwner && !!cfeoiId,
  });

  const closeMutation = useMutation({
    mutationFn: () => updateCfeoiStatus(cfeoiId!, 'Closed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cfeois', cfeoiId] });
      setShowCloseModal(false);
      setCloseConfirmed(false);
    },
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

      {/* Closed-state banner (owner only) */}
      {isOwner && cfeoi.status === 'Closed' && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="max-w-[1200px] mx-auto flex items-start sm:items-center gap-3">
            <svg className="w-4 h-4 text-blue-700 mt-0.5 sm:mt-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-900">
              <span className="font-semibold">This CFEOI is now closed.</span> It is no longer accepting new expressions of interest. You can still review submitted applications below.
            </p>
          </div>
        </div>
      )}

      {/* Success banner */}
      {showSuccessBanner && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-emerald-900">
                {successMessage}
              </p>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="text-emerald-600 hover:text-emerald-800 p-1 rounded transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
          <div className="w-full lg:w-[30%] flex flex-col gap-6 sticky top-24">
            {isOwner && cfeoi.status === 'Open' && (
              <SidebarCard>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Manage CFEOI</h3>
                <div className="flex flex-col gap-3">
                  <Link
                    to={`/cfeois/${cfeoiId}/edit`}
                    className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                  >
                    Edit Details
                  </Link>
                  <button
                    onClick={() => setShowCloseModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2.5 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                  >
                    Close CFEOI
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">Closing is irreversible and stops new applications.</p>
              </SidebarCard>
            )}

            {isOwner && cfeoi.status === 'Closed' && (
              <SidebarCard>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Manage CFEOI</h3>
                <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm text-gray-600">This CFEOI is closed. Editing and closing are no longer available — closure is a terminal state.</p>
                </div>
              </SidebarCard>
            )}

            {isOwner && (
              <SidebarCard>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Expressions of Interest</h3>
                <p className="text-sm text-gray-500 mb-6">Current applications received for this role.</p>
                <div className="flex items-end justify-between mb-6">
                  <div className="flex flex-col">
                    <span className="text-4xl font-bold text-gray-900 leading-none">{eois?.length ?? 0}</span>
                    <span className="text-sm text-gray-500 mt-1">Total Received</span>
                  </div>
                </div>
                <Link
                  to={`/cfeois/${cfeoiId}/eois`}
                  className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  View All EOIs
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </SidebarCard>
            )}

            <SidebarCard>
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

      {/* Close CFEOI confirmation modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Close CFEOI?</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                This action is irreversible. Once closed, {cfeoi.title} will no longer accept new expressions of interest, and it cannot be reopened.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-y border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={closeConfirmed}
                  onChange={(e) => setCloseConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-brand border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I understand that closing this CFEOI is a permanent action and cannot be undone.
                </span>
              </label>
            </div>
            {closeMutation.isError && (
              <p className="text-sm text-red-600 px-6 pt-4">Something went wrong. Please try again.</p>
            )}
            <div className="px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setCloseConfirmed(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => closeMutation.mutate()}
                disabled={!closeConfirmed || closeMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {closeMutation.isPending ? 'Closing...' : 'Close CFEOI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
