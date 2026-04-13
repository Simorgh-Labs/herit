import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listCfeois } from '../../api/cfeois';
import { listProposals } from '../../api/proposals';
import type { CfeoiResourceType } from '../../types';
import CfeoiCard from '../../components/CfeoiCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function CfeoiDirectoryPage() {
  const [search, setSearch] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<CfeoiResourceType | null>(null);

  // TODO: replace with server-side filtering once backend supports query parameters
  const { data: cfeois, isLoading, isError } = useQuery({
    queryKey: ['cfeois'],
    queryFn: () => listCfeois(),
    select: (data) => data.filter((c) => c.status === 'Open'),
  });

  const { data: proposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: listProposals,
  });

  const proposalMap = Object.fromEntries((proposals ?? []).map((p) => [p.id, p.title]));

  const filtered = (cfeois ?? []).filter((c) => {
    const query = search.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query);
    const matchesType = resourceTypeFilter === null || c.resourceType === resourceTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full pb-16 bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1200px] mx-auto px-6">
          <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li><Link to="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span className="text-gray-900 font-medium">CFEOI Directory</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Filters</h2>

              {/* Resource Type Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Resource Type</h3>
                <div className="space-y-2">
                  {(['Human', 'NonHuman'] as CfeoiResourceType[]).map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={resourceTypeFilter === type}
                        onChange={() => setResourceTypeFilter(resourceTypeFilter === type ? null : type)}
                        className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                      />
                      <span className="text-sm text-gray-700">{type === 'NonHuman' ? 'Non-Human' : type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setSearch(''); setResourceTypeFilter(null); }}
                className="text-sm text-gray-500 hover:text-brand transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Search Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
              <div className="relative w-full sm:w-[400px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or description…"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
              </div>
              <p className="text-sm text-gray-500 whitespace-nowrap">
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              </p>
            </div>

            {/* Results */}
            {isLoading && <LoadingSpinner />}
            {isError && (
              <div className="py-10 text-center text-sm text-red-600">
                Failed to load roles. Please try again.
              </div>
            )}
            {!isLoading && !isError && (
              <>
                {filtered.length === 0 ? (
                  <EmptyState
                    title="No open roles found"
                    description="Try adjusting your search or filters, or check back later."
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    {filtered.map((c) => (
                      <CfeoiCard
                        key={c.id}
                        cfeoi={c}
                        proposalTitle={proposalMap[c.proposalId]}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
