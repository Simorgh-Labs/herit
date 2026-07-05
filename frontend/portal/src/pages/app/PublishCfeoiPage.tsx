import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProposalById } from '../../api/proposals';
import { publishCfeoi } from '../../api/cfeois';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { CfeoiResourceType, ProposalStatus } from '../../types';

const RESOURCEABLE_STATUSES: ProposalStatus[] = ['Resourcing', 'Submitted', 'UnderReview', 'Approved'];

export default function PublishCfeoiPage() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<CfeoiResourceType>('Human');
  const [tags, setTags] = useState('');

  const { data: proposal, isLoading: isProposalLoading, isError } = useQuery({
    queryKey: ['proposals', proposalId],
    queryFn: () => getProposalById(proposalId!),
    enabled: !!proposalId,
  });

  const mutation = useMutation({
    mutationFn: () =>
      publishCfeoi({
        title,
        description,
        resourceType,
        proposalId: proposalId!,
        tags: tags || undefined,
      }),
    onSuccess: (newId) => {
      navigate(`/cfeois/${newId}?published=true`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    mutation.mutate();
  };

  if (isProposalLoading || isUserLoading) return <LoadingSpinner className="py-32" />;

  if (isError || !proposal) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Proposal not found</h2>
        <p className="text-gray-600 mb-6">This proposal may have been removed or is not available.</p>
        <Link to="/my-proposals" className="text-brand hover:underline font-medium">← Back to My Proposals</Link>
      </div>
    );
  }

  const isOwner = !!currentUser && currentUser.id === proposal.authorId;

  if (!isOwner || !RESOURCEABLE_STATUSES.includes(proposal.status)) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cannot publish a CFEOI</h2>
        <p className="text-gray-600 mb-6">
          {isOwner
            ? 'This proposal must be in Resourcing status (or later) before you can publish a CFEOI.'
            : 'You do not have permission to publish a CFEOI for this proposal.'}
        </p>
        <Link to={`/proposals/${proposalId}`} className="text-brand hover:underline font-medium">← Back to Proposal</Link>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[800px] mx-auto px-6">
          <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500 mb-2">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li><Link to="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <Link to={`/proposals/${proposalId}`} className="hover:text-brand transition-colors">{proposal.title}</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span className="text-gray-900 font-medium">Publish CFEOI</span>
                </div>
              </li>
            </ol>
          </nav>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Publish New CFEOI</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a Call for Expression of Interest under {proposal.title}.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 pt-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8 space-y-6">

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lead System Architect Search"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand shadow-sm transition-all placeholder-gray-400"
                />
              </div>

              {/* Resource Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Resource Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex-1 flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${resourceType === 'Human' ? 'border-brand bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="resourceType"
                      value="Human"
                      checked={resourceType === 'Human'}
                      onChange={() => setResourceType('Human')}
                      className="mt-0.5 accent-brand"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Human</p>
                      <p className="text-xs text-gray-500">Skills &amp; expertise</p>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${resourceType === 'NonHuman' ? 'border-brand bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="resourceType"
                      value="NonHuman"
                      checked={resourceType === 'NonHuman'}
                      onChange={() => setResourceType('NonHuman')}
                      className="mt-0.5 accent-brand"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Non-Human</p>
                      <p className="text-xs text-gray-500">Infrastructure, real estate, equipment, financial support</p>
                    </div>
                  </label>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the responsibilities and expectations..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand shadow-sm transition-all placeholder-gray-400 resize-y"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-semibold text-gray-800 mb-1">
                  Tags{' '}
                  <span className="text-gray-400 font-normal text-xs ml-1">(Optional, comma separated)</span>
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder={resourceType === 'Human' ? 'e.g. System Architecture, HL7 Integration' : 'e.g. Cold Chain Storage, Solar Power'}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand shadow-sm transition-all placeholder-gray-400"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  {resourceType === 'Human'
                    ? 'List the skills or expertise required for this role.'
                    : 'List the specifications for this resource.'}
                </p>
              </div>

              {mutation.isError && (
                <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 sm:px-8 border-t border-gray-200 flex flex-col sm:flex-row-reverse items-center gap-4">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-brand hover:bg-brand-dark shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-60"
              >
                {mutation.isPending ? 'Publishing...' : 'Publish CFEOI'}
              </button>
              <Link
                to={`/proposals/${proposalId}`}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel and return to proposal
              </Link>
              <p className="sm:mr-auto text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Publishing immediately creates an Open CFEOI — there is no draft state.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
