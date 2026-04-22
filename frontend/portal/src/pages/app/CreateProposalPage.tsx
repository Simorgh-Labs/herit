import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createProposal } from '../../api/proposals';
import { listOrganisations } from '../../api/organisations';
import { getRfpById } from '../../api/rfps';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Rfp } from '../../types';

export default function CreateProposalPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rfpId = searchParams.get('rfpId') ?? undefined;

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [organisationId, setOrganisationId] = useState('');
  const [longDescription, setLongDescription] = useState('');

  const { data: organisations, isLoading: orgsLoading } = useQuery({
    queryKey: ['organisations'],
    queryFn: listOrganisations,
  });

  const { data: rfp, isLoading: rfpLoading } = useQuery<Rfp>({
    queryKey: ['rfps', rfpId],
    queryFn: () => getRfpById(rfpId!),
    enabled: !!rfpId,
  });

  useEffect(() => {
    if (rfp?.organisationId) {
      setOrganisationId(rfp.organisationId);
    }
  }, [rfp?.organisationId]);

  const mutation = useMutation({
    mutationFn: () =>
      createProposal({
        title,
        shortDescription,
        longDescription,
        organisationId,
        rfpId,
      }),
    onSuccess: (newId) => {
      navigate(`/proposals/${newId}?created=true`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organisationId) return;
    mutation.mutate();
  };

  if (rfpId && rfpLoading) return <LoadingSpinner className="py-32" />;

  const isRfpMode = !!rfpId && !!rfp;
  const rfpOrg = isRfpMode ? organisations?.find((o) => o.id === rfp.organisationId) : undefined;

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
                  <Link to="/my-proposals" className="hover:text-brand transition-colors">My Proposals</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span className="text-gray-900 font-medium">
                    {isRfpMode ? 'Create Proposal (In Response to RFP)' : 'Create'}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Create New Proposal</h1>
              <p className="mt-1 text-sm text-gray-500">
                {isRfpMode
                  ? `Responding to: ${rfp.title}`
                  : 'Draft your civic initiative for government review.'}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                Ideation
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Private
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 pt-8">
        {/* RFP banner */}
        {isRfpMode && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Responding to RFP:{' '}
                <Link to={`/rfps/${rfp.id}`} className="font-semibold text-blue-600 hover:underline">
                  {rfp.title}
                </Link>
              </p>
              {rfpOrg && (
                <p className="text-xs text-blue-700 mt-0.5">{rfpOrg.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Form Card */}
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

              {/* Organisation */}
              <div>
                <label htmlFor="organisation" className="block text-sm font-semibold text-gray-800 mb-1">
                  Associated Organisation <span className="text-red-500">*</span>
                </label>
                {orgsLoading && <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />}
                {!orgsLoading && isRfpMode && (
                  <input
                    type="text"
                    readOnly
                    value={rfpOrg?.name ?? ''}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-700 text-sm bg-gray-50 cursor-not-allowed"
                  />
                )}
                {!orgsLoading && !isRfpMode && (
                  <select
                    id="organisation"
                    required
                    value={organisationId}
                    onChange={(e) => setOrganisationId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand shadow-sm transition-all bg-white"
                  >
                    <option value="" disabled>Select an organisation...</option>
                    {organisations?.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                )}
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
                {mutation.isPending ? 'Saving...' : 'Save Proposal'}
              </button>
              <Link
                to="/my-proposals"
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </Link>
              <p className="sm:mr-auto text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Saved as Private — only you can see it until you change the visibility.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
