import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCfeoiById } from '../../api/cfeois';
import { getProposalById } from '../../api/proposals';
import { listMyEois, submitEoi } from '../../api/eois';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SubmitEoiPage() {
  const { cfeoiId } = useParams<{ cfeoiId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoading: isUserLoading } = useCurrentUser();

  const [message, setMessage] = useState('');

  const { data: cfeoi, isLoading: isCfeoiLoading, isError } = useQuery({
    queryKey: ['cfeois', cfeoiId],
    queryFn: () => getCfeoiById(cfeoiId!),
    enabled: !!cfeoiId,
  });

  const { data: proposal, isLoading: isProposalLoading } = useQuery({
    queryKey: ['proposals', cfeoi?.proposalId],
    queryFn: () => getProposalById(cfeoi!.proposalId),
    enabled: !!cfeoi?.proposalId,
  });

  const { data: myEois, isLoading: isMyEoisLoading } = useQuery({
    queryKey: ['eois', 'my'],
    queryFn: listMyEois,
    enabled: !!cfeoiId,
  });

  const myEoi = myEois?.find((eoi) => eoi.cfeoiId === cfeoiId);

  const mutation = useMutation({
    mutationFn: () => submitEoi({ message, cfeoiId: cfeoiId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eois', 'my'] });
      navigate(`/cfeois/${cfeoiId}?submitted=true`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    mutation.mutate();
  };

  if (isCfeoiLoading || isUserLoading || isMyEoisLoading || (cfeoi && isProposalLoading)) {
    return <LoadingSpinner className="py-32" />;
  }

  if (isError || !cfeoi) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CFEOI not found</h2>
        <p className="text-gray-600 mb-6">This CFEOI may have been removed or is not available.</p>
        <Link to="/cfeois" className="text-brand hover:underline font-medium">← Back to CFEOI Directory</Link>
      </div>
    );
  }

  if (cfeoi.status !== 'Open' || myEoi) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cannot express interest</h2>
        <p className="text-gray-600 mb-6">
          {myEoi
            ? 'You have already expressed interest in this CFEOI. Track or withdraw it from My EOIs.'
            : 'This CFEOI is closed and is no longer accepting new expressions of interest.'}
        </p>
        <Link to={`/cfeois/${cfeoiId}`} className="text-brand hover:underline font-medium">← Back to CFEOI Details</Link>
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
              <li><Link to="/cfeois" className="hover:text-brand transition-colors">CFEOI Directory</Link></li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <Link to={`/cfeois/${cfeoiId}`} className="hover:text-brand transition-colors">{cfeoi.title}</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span className="text-gray-900 font-medium">Express Interest</span>
                </div>
              </li>
            </ol>
          </nav>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Express Interest</h1>
            <p className="mt-1 text-sm text-gray-500">
              Introduce yourself to the proposal team. Your note is the only thing they'll see with your expression of interest.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 pt-8">
        {/* Context strip */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <div>
            <p className="text-xs text-blue-700 mb-1">You're expressing interest in</p>
            <p className="text-sm font-bold text-gray-900">{cfeoi.title}</p>
            {proposal && <p className="text-xs text-gray-500 mt-0.5">{proposal.title}</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-1">
                  Cover note <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Tell the team why you're a good fit — relevant experience, motivation, and how you'd like to contribute.
                </p>
                <textarea
                  id="message"
                  required
                  rows={9}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. I'm a solutions architect with 12 years in public-sector health IT, including two national FHIR rollouts. I'd love to help shape the data-exchange architecture for this programme…"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-brand focus:border-brand shadow-sm transition-all placeholder-gray-400 resize-y"
                />
                <p className="mt-1.5 text-xs text-gray-500">Required. This note is all the proposal owner will see.</p>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-gray-600">
                  Your EOI starts as <span className="font-semibold">Private</span> — visible only to you. You can switch it to{' '}
                  <span className="font-semibold">Shared</span> (visible to the proposal owner and relevant staff) later from My EOIs.
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
                {mutation.isPending ? 'Submitting...' : 'Submit expression of interest'}
              </button>
              <Link
                to={`/cfeois/${cfeoiId}`}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
