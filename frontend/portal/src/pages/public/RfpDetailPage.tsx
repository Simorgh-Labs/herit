import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';
import { getRfpById } from '../../api/rfps';
import { getOrganisationById } from '../../api/organisations';
import { listProposals } from '../../api/proposals';
import { apiScopes } from '../../auth/authScopes';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProposalCard from '../../components/ProposalCard';
import SidebarCard from '../../components/SidebarCard';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function RfpDetailPage() {
  const { rfpId } = useParams<{ rfpId: string }>();
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

  const { data: rfp, isLoading, isError } = useQuery({
    queryKey: ['rfps', rfpId],
    queryFn: () => getRfpById(rfpId!),
    enabled: !!rfpId,
  });

  const { data: org } = useQuery({
    queryKey: ['organisations', rfp?.organisationId],
    queryFn: () => getOrganisationById(rfp!.organisationId),
    enabled: !!rfp?.organisationId,
  });

  // TODO: replace with server-side filtering once backend supports query parameters
  const { data: relatedProposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: listProposals,
    select: (data) =>
      data
        .filter((p) => p.visibility === 'Public' && p.rfpId === rfpId)
        .slice(0, 3),
    enabled: !!rfpId,
  });

  const handleSignIn = async () => {
    try {
      await instance.loginRedirect({ scopes: apiScopes });
    } catch (error) {
      console.error('[Herit] loginRedirect failed:', error);
    }
  };

  if (isLoading) return <LoadingSpinner className="py-32" />;

  if (isError || !rfp) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">RFP not found</h2>
        <p className="text-gray-600 mb-6">This RFP may have been removed or is not publicly available.</p>
        <Link to="/rfps" className="text-brand hover:underline font-medium">← Back to RFPs</Link>
      </div>
    );
  }

  if (rfp.status !== 'Published') {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">RFP not available</h2>
        <p className="text-gray-600 mb-6">This RFP is not currently published.</p>
        <Link to="/rfps" className="text-brand hover:underline font-medium">← Back to RFPs</Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumb & Header */}
      <section className="pt-10 pb-8 bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500 mb-6">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li><Link to="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <Link to="/rfps" className="hover:text-brand transition-colors">Browse RFPs</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">{rfp.title}</span>
                </div>
              </li>
            </ol>
          </nav>
          {org && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
              <span className="font-medium text-gray-900">{org.name}</span>
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{rfp.title}</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left (70%) */}
            <div className="w-full lg:w-[70%]">
              <div className="prose prose-blue max-w-none text-gray-600">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Overview</h2>
                <p className="mb-6 leading-relaxed">{rfp.longDescription}</p>
              </div>

              {rfp.tags && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {rfp.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar (30%) */}
            <aside className="w-full lg:w-[30%] flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Auth CTA */}
                {isAuthenticated ? (
                  <SidebarCard className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Submit a Proposal</h3>
                    <p className="text-sm text-gray-600 mb-6">Respond to this RFP by submitting your proposal.</p>
                    <Link
                      to={`/proposals/new?rfpId=${rfp.id}`}
                      className="w-full flex items-center justify-center px-5 py-3 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors shadow-sm"
                    >
                      Submit a Proposal
                    </Link>
                  </SidebarCard>
                ) : (
                  <SidebarCard className="shadow-md text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Sign in to contribute</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      You need an account to submit proposals, express interest in roles, or track your contributions.
                    </p>
                    <button
                      onClick={handleSignIn}
                      className="w-full flex items-center justify-center gap-3 px-5 py-3 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors shadow-sm"
                    >
                      <GoogleIcon />
                      Sign in with Google
                    </button>
                  </SidebarCard>
                )}

                {/* Related Proposals */}
                {relatedProposals && relatedProposals.length > 0 && (
                  <SidebarCard className="bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Related Proposals</h3>
                    <div className="space-y-4">
                      {relatedProposals.map((p) => (
                        <ProposalCard key={p.id} proposal={p} compact />
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Link
                        to="/proposals"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-brand border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors w-full"
                      >
                        Explore All Proposals
                      </Link>
                    </div>
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
