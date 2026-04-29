import { useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';
import { getProposalById, deleteProposal, updateProposalStatus, setProposalVisibility } from '../../api/proposals';
import { getOrganisationById } from '../../api/organisations';
import { getRfpById } from '../../api/rfps';
import { listCfeois } from '../../api/cfeois';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { apiScopes } from '../../auth/authScopes';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import CfeoiCard from '../../components/CfeoiCard';
import SidebarCard from '../../components/SidebarCard';
import type { ProposalVisibility } from '../../types';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const visibilityConfig: Record<ProposalVisibility, { label: string; description: string; badgeClass: string }> = {
  Private: {
    label: 'Private',
    description: 'Only you can see this',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  Shared: {
    label: 'Shared',
    description: 'Visible to signed-in users',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  Public: {
    label: 'Public',
    description: 'Visible to everyone',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
  },
};

const STATUSES_WITH_VISIBILITY_CONTROL = new Set(['Ideation', 'Resourcing', 'Approved']);

export default function ProposalDetailPage() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const [showSuccessBanner, setShowSuccessBanner] = useState(searchParams.get('created') === 'true');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawConfirmed, setWithdrawConfirmed] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState<ProposalVisibility | ''>('');

  const { data: proposal, isLoading, isError } = useQuery({
    queryKey: ['proposals', proposalId],
    queryFn: () => getProposalById(proposalId!),
    enabled: !!proposalId,
  });

  const { data: org } = useQuery({
    queryKey: ['organisations', proposal?.organisationId],
    queryFn: () => getOrganisationById(proposal!.organisationId),
    enabled: !!proposal?.organisationId,
  });

  const { data: rfp } = useQuery({
    queryKey: ['rfps', proposal?.rfpId],
    queryFn: () => getRfpById(proposal!.rfpId!),
    enabled: !!proposal?.rfpId,
  });

  const { data: cfeois } = useQuery({
    queryKey: ['cfeois'],
    queryFn: () => listCfeois(),
    select: (data) => data.filter((c) => c.status === 'Open' && c.proposalId === proposalId),
    enabled: !!proposalId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProposal(proposalId!),
    onSuccess: () => navigate('/my-proposals'),
  });

  const moveToResourcingMutation = useMutation({
    mutationFn: () => updateProposalStatus(proposalId!, 'Resourcing'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals', proposalId] }),
  });

  const submitMutation = useMutation({
    mutationFn: () => updateProposalStatus(proposalId!, 'Submitted'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals', proposalId] }),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => updateProposalStatus(proposalId!, 'Withdrawn'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', proposalId] });
      setShowWithdrawModal(false);
      setWithdrawConfirmed(false);
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: (v: ProposalVisibility) => setProposalVisibility(proposalId!, v),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', proposalId] });
      setShowVisibilityModal(false);
    },
  });

  const handleSignIn = async () => {
    try {
      await instance.loginRedirect({ scopes: apiScopes });
    } catch (error) {
      console.error('[Herit] loginRedirect failed:', error);
    }
  };

  if (isLoading) return <LoadingSpinner className="py-32" />;

  if (isError || !proposal) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Proposal not found</h2>
        <p className="text-gray-600 mb-6">This proposal may have been removed or is not publicly available.</p>
        <Link to="/proposals" className="text-brand hover:underline font-medium">← Back to Proposals</Link>
      </div>
    );
  }

  if (proposal.visibility !== 'Public' && !isAuthenticated) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Not found</h2>
        <p className="text-gray-600 mb-6">This proposal is not publicly available.</p>
        <Link to="/proposals" className="text-brand hover:underline font-medium">← Back to Proposals</Link>
      </div>
    );
  }

  const isOwner = !!currentUser && currentUser.id === proposal.authorId;
  const visInfo = visibilityConfig[proposal.visibility];
  const showVisibilityCard = isOwner && STATUSES_WITH_VISIBILITY_CONTROL.has(proposal.status);

  return (
    <div className="w-full pb-16">
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
                Proposal created! Your proposal has been saved as Private. Only you can see it until you change the visibility.
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
                  <Link to="/proposals" className="hover:text-brand transition-colors">Public Proposals</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">{proposal.title}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Proposal Header */}
      <section className="pt-10 pb-8 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-grow max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <StatusBadge type="proposal" status={proposal.status} />
                {isOwner && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${visInfo.badgeClass}`}>
                    <LockIcon />
                    {visInfo.label}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                {proposal.title}
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-6">{proposal.shortDescription}</p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                {org && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {org.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{org.name}</p>
                    </div>
                  </div>
                )}
                {rfp && (
                  <>
                    <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Linked RFP</p>
                        <Link to={`/rfps/${rfp.id}`} className="font-medium text-brand hover:underline">{rfp.title}</Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left (70%) */}
            <div className="w-full lg:w-[70%]">
              <div className="prose prose-blue max-w-none text-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Overview</h2>
                <p className="mb-8 leading-relaxed whitespace-pre-line">{proposal.longDescription}</p>
              </div>
            </div>

            {/* Right Sidebar (30%) */}
            <aside className="w-full lg:w-[30%] flex-shrink-0">
              <div className="sticky top-24 space-y-6">

                {/* Owner: Actions card */}
                {isOwner && proposal.status === 'Ideation' && (
                  <SidebarCard>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => moveToResourcingMutation.mutate()}
                        disabled={moveToResourcingMutation.isPending}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-brand hover:bg-brand-dark shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-60"
                      >
                        Move to Resourcing
                      </button>
                      <Link
                        to={`/proposals/${proposalId}/edit`}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                      >
                        Edit Proposal
                      </Link>
                      <div className="pt-2 border-t border-gray-200">
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full flex items-center justify-center px-4 py-2.5 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                        >
                          Delete Proposal
                        </button>
                      </div>
                    </div>
                  </SidebarCard>
                )}

                {isOwner && proposal.status === 'Resourcing' && (
                  <SidebarCard>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => submitMutation.mutate()}
                        disabled={submitMutation.isPending}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-brand hover:bg-brand-dark shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-60"
                      >
                        {submitMutation.isPending ? 'Submitting...' : 'Submit to Organisation'}
                      </button>
                      <Link
                        to={`/proposals/${proposalId}/edit`}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                      >
                        Edit Proposal
                      </Link>
                      <Link
                        to={`/proposals/${proposalId}/cfeois/new`}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-brand/30 text-sm font-medium rounded-lg text-brand bg-brand-light hover:bg-brand/10 shadow-sm transition-colors"
                      >
                        Publish a CFEOI
                      </Link>
                      <div className="pt-2 border-t border-gray-200">
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full flex items-center justify-center px-4 py-2.5 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                        >
                          Delete Proposal
                        </button>
                      </div>
                    </div>
                  </SidebarCard>
                )}

                {isOwner && proposal.status === 'Submitted' && (
                  <SidebarCard>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Actions</h3>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="w-full flex items-center justify-center px-4 py-2.5 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                    >
                      Withdraw Proposal
                    </button>
                  </SidebarCard>
                )}

                {isOwner && proposal.status === 'UnderReview' && (
                  <SidebarCard>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-orange-700 mb-1">Under Review</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Your proposal is currently being reviewed by the organisation. No changes can be made at this time.
                        </p>
                      </div>
                    </div>
                  </SidebarCard>
                )}

                {isOwner && proposal.status === 'Approved' && (
                  <SidebarCard>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 mb-1">Proposal Approved</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Congratulations! Your proposal has been approved by the organisation.
                        </p>
                      </div>
                    </div>
                  </SidebarCard>
                )}

                {isOwner && proposal.status === 'Withdrawn' && (
                  <SidebarCard>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Proposal Withdrawn</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          This proposal has been withdrawn and is kept as a historical record. No further actions are available.
                        </p>
                      </div>
                    </div>
                  </SidebarCard>
                )}

                {/* Owner: Visibility card — only for statuses that allow it */}
                {showVisibilityCard && (
                  <SidebarCard>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Visibility</h3>
                      <button
                        onClick={() => {
                          setPendingVisibility(proposal.visibility);
                          setShowVisibilityModal(true);
                        }}
                        className="text-xs font-medium text-brand hover:text-brand-dark transition-colors"
                      >
                        Change
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${visInfo.badgeClass}`}>
                          {visInfo.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{visInfo.description}</p>
                      </div>
                    </div>
                  </SidebarCard>
                )}

                {/* Owner: CFEOIs card (Ideation — disabled) */}
                {isOwner && proposal.status === 'Ideation' && (
                  <SidebarCard>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Volunteer Roles (CFEOIs)</h3>
                    <button
                      disabled
                      title="Move to Resourcing first to publish a CFEOI"
                      className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-gray-400 bg-gray-100 cursor-not-allowed shadow-sm"
                    >
                      Publish a CFEOI
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">Move to Resourcing first</p>
                  </SidebarCard>
                )}

                {/* Non-owner: Join the Team */}
                {!isOwner && (
                  <SidebarCard className="bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Join the Team</h3>
                        <p className="text-xs text-gray-500">Sign in to interact with this proposal</p>
                      </div>
                    </div>
                    {!isAuthenticated && (
                      <button
                        onClick={handleSignIn}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-brand rounded-xl hover:bg-brand-dark transition-colors"
                      >
                        <GoogleIcon />
                        Sign in with Google
                      </button>
                    )}
                  </SidebarCard>
                )}

                {/* Related CFEOIs */}
                {cfeois && cfeois.length > 0 && (
                  <SidebarCard>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                      Related Volunteer Roles
                    </h3>
                    <div className="space-y-4">
                      {cfeois.map((c, i) => (
                        <div key={c.id}>
                          <CfeoiCard cfeoi={c} compact />
                          {i < cfeois.length - 1 && <div className="h-px w-full bg-gray-200 mt-4" />}
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/cfeois"
                      className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand hover:underline"
                    >
                      View all related roles
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </SidebarCard>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Proposal</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{proposal.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw confirmation modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Withdraw proposal?</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                This action will remove the proposal from active review and resourcing. It will be kept as a historical record, but cannot be reactivated.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-y border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withdrawConfirmed}
                  onChange={(e) => setWithdrawConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-brand border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I understand that withdrawing this proposal is a permanent action and cannot be undone.
                </span>
              </label>
            </div>
            {withdrawMutation.isError && (
              <p className="text-sm text-red-600 px-6 pt-4">Something went wrong. Please try again.</p>
            )}
            <div className="px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawConfirmed(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => withdrawMutation.mutate()}
                disabled={!withdrawConfirmed || withdrawMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change visibility modal */}
      {showVisibilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Change Visibility</h2>
            <div className="space-y-2 mb-6">
              {(['Private', 'Shared', 'Public'] as ProposalVisibility[]).map((v) => (
                <label
                  key={v}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${pendingVisibility === v ? 'border-brand bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={v}
                    checked={pendingVisibility === v}
                    onChange={() => setPendingVisibility(v)}
                    className="mt-0.5 accent-brand"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v}</p>
                    <p className="text-xs text-gray-500">{visibilityConfig[v].description}</p>
                  </div>
                </label>
              ))}
            </div>
            {visibilityMutation.isError && (
              <p className="text-sm text-red-600 mb-4">Something went wrong. Please try again.</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowVisibilityModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => pendingVisibility && visibilityMutation.mutate(pendingVisibility as ProposalVisibility)}
                disabled={visibilityMutation.isPending || !pendingVisibility}
                className="px-4 py-2 text-sm font-medium text-white bg-brand border border-transparent rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {visibilityMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
