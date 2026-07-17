import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listRfps } from '../../api/rfps';
import { listOrganisations } from '../../api/organisations';
import type { RfpStatus } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const TABS: RfpStatus[] = ['Draft', 'Approved', 'Published'];

const EMPTY_STATE_COPY: Record<RfpStatus, { title: string; description: string }> = {
  Draft: { title: 'No draft RFPs', description: 'New RFPs start in Draft. Create one to get started.' },
  Approved: {
    title: 'No approved RFPs',
    description: 'RFPs move here once a staff member approves them from Draft.',
  },
  Published: {
    title: 'No published RFPs',
    description: 'Approved RFPs become visible here once published to the portal.',
  },
};

function isRfpStatus(value: string | null): value is RfpStatus {
  return TABS.includes(value as RfpStatus);
}

export default function RfpsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const statusParam = searchParams.get('status');
  const activeTab: RfpStatus = isRfpStatus(statusParam) ? statusParam : 'Draft';

  const setActiveTab = (status: RfpStatus) => {
    setSearchParams({ status });
  };

  const {
    data: rfps,
    isLoading,
    isError,
  } = useQuery({ queryKey: ['rfps'], queryFn: listRfps });

  const { data: orgs } = useQuery({ queryKey: ['organisations'], queryFn: listOrganisations });

  const orgMap = useMemo(
    () => Object.fromEntries((orgs ?? []).map((o) => [o.id, o.name])),
    [orgs],
  );

  const counts = useMemo(() => {
    const result: Record<RfpStatus, number> = { Draft: 0, Approved: 0, Published: 0 };
    for (const rfp of rfps ?? []) result[rfp.status]++;
    return result;
  }, [rfps]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (rfps ?? []).filter((rfp) => {
      if (rfp.status !== activeTab) return false;
      if (!query) return true;
      return (
        rfp.title.toLowerCase().includes(query) ||
        (orgMap[rfp.organisationId] ?? '').toLowerCase().includes(query) ||
        (rfp.tags ?? '').toLowerCase().includes(query)
      );
    });
  }, [rfps, activeTab, search, orgMap]);

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8 pb-16">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">RFPs</h1>
          <p className="text-sm text-neutral-500">
            Per ADR-017, any staff user can perform every status transition, including on RFPs they authored —
            there is no separate-approver role.
          </p>
        </div>
        <Link
          to="/rfps/new"
          className="shrink-0 inline-flex items-center gap-2 px-4 h-10 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
        >
          New RFP
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div className="flex gap-2">
          {TABS.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`inline-flex items-center gap-2 px-3.5 h-9 rounded-lg text-sm font-medium transition-colors ${
                activeTab === status
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {status}
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                  activeTab === status ? 'bg-white text-brand-700' : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {counts[status]}
              </span>
            </button>
          ))}
        </div>
        <div className="w-full sm:w-60">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search RFPs"
            className="w-full px-3.5 h-[38px] bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
          />
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && (
        <div className="py-10 text-center text-sm text-status-danger-text">Failed to load RFPs. Please try again.</div>
      )}

      {!isLoading && !isError && (
        <>
          {filtered.length === 0 ? (
            <EmptyState title={EMPTY_STATE_COPY[activeTab].title} description={EMPTY_STATE_COPY[activeTab].description} />
          ) : (
            <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft overflow-hidden">
              <div className="grid grid-cols-[1fr_200px_130px] gap-3 px-5 py-3 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                <span>Title</span>
                <span>Organisation</span>
                <span>Status</span>
              </div>
              {filtered.map((rfp) => (
                <Link
                  key={rfp.id}
                  to={`/rfps/${rfp.id}`}
                  className="grid grid-cols-[1fr_200px_130px] gap-3 px-5 py-4 border-b border-neutral-200 last:border-b-0 items-center hover:bg-neutral-50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-neutral-900 mb-0.5">{rfp.title}</div>
                    {rfp.tags && <div className="text-xs text-neutral-400">{rfp.tags}</div>}
                  </div>
                  <span className="text-sm text-neutral-500">{orgMap[rfp.organisationId] ?? '—'}</span>
                  <StatusBadge type="rfp" status={rfp.status} />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
