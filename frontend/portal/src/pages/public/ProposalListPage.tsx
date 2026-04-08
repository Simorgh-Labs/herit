import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listProposals } from '../../api/proposals';
import { listOrganisations } from '../../api/organisations';
import type { ProposalStatus } from '../../types';
import ProposalCard from '../../components/ProposalCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const ALL_STATUSES: ProposalStatus[] = ['Ideation', 'Resourcing', 'Submitted', 'UnderReview', 'Approved', 'Withdrawn'];

export default function ProposalListPage() {
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ProposalStatus[]>([]);

  // TODO: replace with server-side filtering once backend supports query parameters
  const { data: proposals, isLoading, isError } = useQuery({
    queryKey: ['proposals'],
    queryFn: listProposals,
    select: (data) => data.filter((p) => p.visibility === 'Public'),
  });

  const { data: orgs } = useQuery({
    queryKey: ['organisations'],
    queryFn: listOrganisations,
  });

  const orgMap = Object.fromEntries((orgs ?? []).map((o) => [o.id, o.name]));

  const filtered = (proposals ?? []).filter((p) => {
    const query = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(query) ||
      p.shortDescription.toLowerCase().includes(query);
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(p.status);
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (status: ProposalStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <section className="pt-12 pb-8 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Public Proposals Directory</h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Discover community-driven initiatives and vendor proposals aimed at addressing national needs.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-200">
            <div className="relative w-full md:w-2/3 flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search proposals by title or description..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Grid */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Filters */}
            <aside className="w-full lg:w-1/4 flex-shrink-0">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 sticky top-24">
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  <button
                    className="text-sm text-gray-500 hover:text-brand transition-colors"
                    onClick={() => { setSearch(''); setSelectedStatuses([]); }}
                  >
                    Clear All
                  </button>
                </div>
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Status</h4>
                  <div className="space-y-3">
                    {ALL_STATUSES.map((status) => (
                      <label key={status} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => toggleStatus(status)}
                          className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {status === 'UnderReview' ? 'Under Review' : status}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Grid */}
            <div className="flex-grow">
              {isLoading && <LoadingSpinner />}
              {isError && (
                <div className="py-10 text-center text-sm text-red-600">
                  Failed to load proposals. Please try again.
                </div>
              )}
              {!isLoading && !isError && (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600">
                      Showing <span className="font-bold text-gray-900">{filtered.length}</span> results
                    </p>
                  </div>
                  {filtered.length === 0 ? (
                    <EmptyState
                      title="No proposals found"
                      description="Try adjusting your search or filters."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filtered.map((p) => (
                        <ProposalCard key={p.id} proposal={p} orgName={orgMap[p.organisationId]} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
