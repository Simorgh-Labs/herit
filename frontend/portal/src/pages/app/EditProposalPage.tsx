import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProposalById, updateProposal } from '../../api/proposals';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import LoadingSpinner from '../../components/LoadingSpinner';

const EDITABLE_STATUSES = new Set(['Ideation', 'Resourcing']);

export default function EditProposalPage() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');

  const { data: proposal, isLoading: isProposalLoading, isError } = useQuery({
    queryKey: ['proposals', proposalId],
    queryFn: () => getProposalById(proposalId!),
    enabled: !!proposalId,
  });

  useEffect(() => {
    if (proposal) {
      setTitle(proposal.title);
      setShortDescription(proposal.shortDescription);
      setLongDescription(proposal.longDescription);
    }
  }, [proposal]);

  const mutation = useMutation({
    mutationFn: () =>
      updateProposal(proposalId!, {
        title,
        shortDescription,
        longDescription,
      }),
    onSuccess: () => {
      navigate(`/proposals/${proposalId}?updated=true`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim() || !longDescription.trim()) return;
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

  if (!isOwner || !EDITABLE_STATUSES.has(proposal.status)) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cannot edit this proposal</h2>
        <p className="text-gray-600 mb-6">
          {isOwner
            ? 'This proposal is no longer in Ideation or Resourcing and can no longer be edited.'
            : 'You do not have permission to edit this proposal.'}
        </p>
        <Link to={`/proposals/${proposalId}`} className="text-brand hover:underline font-medium">← Back to Proposal Details</Link>
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
                  <span className="text-gray-900 font-medium">Edit</span>
                </div>
              </li>
            </ol>
          </nav>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Edit Proposal</h1>
            <p className="mt-1 text-sm text-gray-500">Update the details for this proposal.</p>
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
                  Proposal Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Urban Green Space Revitalization in District 4"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand shadow-sm transition-all placeholder-gray-400"
                />
              </div>

              {/* Short Description */}
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-semibold text-gray-800 mb-1">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="shortDescription"
                  required
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Provide a concise 1-2 sentence summary of your proposal's primary goal..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand shadow-sm transition-all placeholder-gray-400 resize-none"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  This summary will appear in public directories and RFP responses. Max 200 characters.
                </p>
              </div>

              <hr className="border-gray-200" />

              {/* Long Description */}
              <div>
                <label htmlFor="longDescription" className="block text-sm font-semibold text-gray-800 mb-1">
                  Detailed Proposal <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="longDescription"
                  required
                  rows={12}
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  placeholder="Outline the problem, proposed solution, timeline, and expected impact. Use headings and lists to structure your document clearly."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand shadow-sm transition-all placeholder-gray-400 resize-y"
                />
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
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                to={`/proposals/${proposalId}`}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel and return to Proposal Details
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
