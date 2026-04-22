import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listRfps } from '../../api/rfps';
import { listOrganisations } from '../../api/organisations';
import RfpCard from '../../components/RfpCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function RfpListPage() {
  const [search, setSearch] = useState('');
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);

  const toggleOrg = (name: string) => {
    setSelectedOrgs((prev) =>
      prev.includes(name) ? prev.filter((o) => o !== name) : [...prev, name]
    );
  };

  // TODO: replace with server-side filtering once backend supports query parameters
  const { data: rfps, isLoading, isError } = useQuery({
    queryKey: ['rfps'],
    queryFn: listRfps,
    select: (data) => data.filter((rfp) => rfp.status === 'Published'),
  });

  const { data: orgs } = useQuery({
    queryKey: ['organisations'],
    queryFn: listOrganisations,
  });

  const orgMap = Object.fromEntries((orgs ?? []).map((o) => [o.id, o.name]));

  const filtered = (rfps ?? []).filter((rfp) => {
    const query = search.toLowerCase();
    const matchesSearch =
      rfp.title.toLowerCase().includes(query) ||
      (orgMap[rfp.organisationId] ?? '').toLowerCase().includes(query);
    const matchesOrg =
      selectedOrgs.length === 0 || selectedOrgs.includes(orgMap[rfp.organisationId]);
    return matchesSearch && matchesOrg;
  });

  return (
    <div className="w-full">
      {/* Page Header */}
      <section className="pt-16 pb-10 bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Government RFPs</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Browse active Requests for Proposals from various government departments. Find opportunities where your expertise can make a difference.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="relative w-full md:w-2/3">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or organisation…"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-1/4 flex-shrink-0">
              <div className="sticky top-24">
                <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Filters</h3>
                  <button
                    className="text-sm text-brand hover:underline"
                    onClick={() => { setSearch(''); setSelectedOrgs([]); }}
                  >
                    Clear all
                  </button>
                </div>
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Organisation</h4>
                  <div className="space-y-3">
                    {Array.from(new Set(Object.values(orgMap))).map((name) => (
                      <label key={name} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedOrgs.includes(name)}
                          onChange={() => toggleOrg(name)}
                          className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900">{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="w-full lg:w-3/4">
              {isLoading && <LoadingSpinner />}
              {isError && (
                <div className="py-10 text-center text-sm text-red-600">
                  Failed to load RFPs. Please try again.
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
                      title="No RFPs found"
                      description="Try adjusting your search or check back later for new opportunities."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filtered.map((rfp) => (
                        <RfpCard key={rfp.id} rfp={rfp} orgName={orgMap[rfp.organisationId]} />
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
