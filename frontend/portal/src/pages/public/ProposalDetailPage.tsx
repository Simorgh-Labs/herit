import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';
import { getProposalById } from '../../api/proposals';
import { getOrganisationById } from '../../api/organisations';
import { getRfpById } from '../../api/rfps';
import { listCfeois } from '../../api/cfeois';
import { apiScopes } from '../../auth/authScopes';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import CfeoiCard from '../../components/CfeoiCard';
import SidebarCard from '../../components/SidebarCard';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function ProposalDetailPage() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

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

  // TODO: replace with server-side filtering once backend supports query parameters
  const { data: cfeois } = useQuery({
    queryKey: ['cfeois'],
    queryFn: () => listCfeois(),
    select: (data) => data.filter((c) => c.status === 'Open' && c.proposalId === proposalId),
    enabled: !!proposalId,
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

  return (
    <div className="w-full pb-16">
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
                {/* Join the Team */}
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
    </div>
  );
}
