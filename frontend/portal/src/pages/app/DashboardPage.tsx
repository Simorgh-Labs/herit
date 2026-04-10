import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { listProposals } from '../../api/proposals';
import { listMyEois } from '../../api/eois';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Proposal, Eoi } from '../../types';

function ProposalStatusBadge({ status }: { readonly status: Proposal['status'] }) {
  const map: Record<Proposal['status'], { label: string; className: string }> = {
    Ideation:    { label: 'Ideation',      className: 'bg-gray-100 text-gray-600 border-gray-200' },
    Resourcing:  { label: 'Resourcing',    className: 'bg-brand-light text-brand border-brand/20' },
    Submitted:   { label: 'Submitted',     className: 'bg-gray-100 text-gray-600 border-gray-200' },
    UnderReview: { label: 'Under Review',  className: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    Approved:    { label: 'Approved',      className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    Withdrawn:   { label: 'Withdrawn',     className: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  const { label, className } = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function EoiStatusBadge({ status }: { readonly status: Eoi['status'] }) {
  const map: Record<Eoi['status'], { label: string; className: string; dotColor: string }> = {
    Pending:  { label: 'Pending',  className: 'bg-yellow-50 text-yellow-600 border-yellow-200', dotColor: 'bg-yellow-400' },
    Approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-600 border-emerald-200', dotColor: 'bg-emerald-500' },
    Rejected: { label: 'Rejected', className: 'bg-red-50 text-red-600 border-red-200', dotColor: 'bg-red-500' },
  };
  const { label, className, dotColor } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  // TODO: filter by authorId client-side — backend list endpoint has no filter params yet
  const { data: allProposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: listProposals,
  });

  const { data: myEois = [], isLoading: eoisLoading } = useQuery({
    queryKey: ['myEois'],
    queryFn: listMyEois,
  });

  const myProposals = allProposals.filter((p) => p.authorId === user?.id);
  const isNewUser = myProposals.length === 0 && myEois.length === 0;
  const memberSince = user?.termsAcceptedAt
    ? new Date(user.termsAcceptedAt).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto p-6 lg:p-8 flex flex-col gap-6">

      {/* Welcome banner */}
      {!welcomeDismissed && isNewUser && (
        <div className="w-full bg-brand-light rounded-2xl border border-brand/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
          <button
            onClick={() => setWelcomeDismissed(true)}
            aria-label="Dismiss welcome banner"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-6 relative z-10">
            <div className="hidden md:flex w-16 h-16 rounded-full bg-white items-center justify-center shadow-sm border border-brand/10 shrink-0">
              <svg className="w-7 h-7 text-brand opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Welcome to Herit{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
              </h2>
              <p className="text-sm text-gray-500 max-w-2xl">
                Your profile is set up. You can now browse active Requests for Proposals or submit an Expression of Interest.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-3 w-full sm:w-auto relative z-10">
            <Link
              to="/rfps"
              className="flex-1 sm:flex-none text-center bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm"
            >
              Browse RFPs
            </Link>
            <Link
              to="/proposals/new"
              className="flex-1 sm:flex-none text-center bg-white hover:bg-gray-50 text-gray-900 text-sm font-medium py-2.5 px-5 rounded-lg border border-gray-200 transition-colors shadow-sm"
            >
              Create a Proposal
            </Link>
          </div>
        </div>
      )}

      {/* Returning-user banner */}
      {!isNewUser && (
        <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
              {myProposals.length > 0 && ` You have ${myProposals.length} proposal${myProposals.length !== 1 ? 's' : ''}.`}
            </p>
          </div>
          <Link
            to="/my-proposals"
            className="text-sm font-medium text-brand hover:text-brand-dark transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            View updates
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

        {/* Left column (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* My Proposals */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                My Proposals
                <span className="bg-gray-200 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
                  {myProposals.length}
                </span>
              </h3>
              {myProposals.length > 0 && (
                <Link to="/my-proposals" className="text-sm font-medium text-brand hover:text-brand-dark transition-colors">
                  View all
                </Link>
              )}
            </div>

            {proposalsLoading ? (
              <LoadingSpinner />
            ) : myProposals.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 flex flex-col items-center justify-center text-center shadow-sm hover:border-brand/30 transition-colors group">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-light transition-colors">
                  <svg className="w-7 h-7 text-gray-400 group-hover:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-base font-medium text-gray-900 mb-2">No proposals yet</h4>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  You haven't submitted any proposals. Start by browsing active RFPs or create a new proposal from scratch.
                </p>
                <Link
                  to="/proposals/new"
                  className="bg-white hover:bg-gray-50 text-brand text-sm font-medium py-2 px-4 rounded-lg border border-gray-200 shadow-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Start a Proposal
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProposals.map((proposal) => (
                  <div key={proposal.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-2">
                      <ProposalStatusBadge status={proposal.status} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">{proposal.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{proposal.shortDescription}</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-end">
                      <Link
                        to={`/proposals/${proposal.id}`}
                        className="text-sm font-medium text-brand hover:text-brand-dark transition-colors flex items-center gap-1"
                      >
                        Manage
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My EOIs */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                My Expressions of Interest
                <span className="bg-gray-200 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
                  {myEois.length}
                </span>
              </h3>
            </div>

            {eoisLoading ? (
              <LoadingSpinner />
            ) : myEois.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 flex flex-col items-center justify-center text-center shadow-sm hover:border-brand/30 transition-colors group">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-light transition-colors">
                  <svg className="w-7 h-7 text-gray-400 group-hover:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-base font-medium text-gray-900 mb-2">No EOIs submitted</h4>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  Express your interest in contributing to civic projects by submitting an EOI to the directory.
                </p>
                <Link
                  to="/cfeois"
                  className="bg-white hover:bg-gray-50 text-brand text-sm font-medium py-2 px-4 rounded-lg border border-gray-200 shadow-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Submit an EOI
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex flex-col divide-y divide-gray-100">
                  {myEois.map((eoi) => (
                    <div key={eoi.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">EOI</h4>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{eoi.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:ml-auto pl-14 sm:pl-0">
                        <EoiStatusBadge status={eoi.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right column (1/3) */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          {/* Profile summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center border-2 border-gray-100 shrink-0">
                <span className="text-xl font-bold text-brand">
                  {user?.fullName?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{user?.fullName ?? '—'}</h3>
                <p className="text-sm text-gray-500">{user?.email ?? '—'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Profile Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Complete
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Member Since</span>
                <span className="text-sm font-medium text-gray-900">{memberSince}</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-gray-900">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Browse RFPs', to: '/rfps' },
                { label: 'Create Proposal', to: '/proposals/new' },
                { label: 'CFEOI Directory', to: '/cfeois' },
              ].map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                  <svg className="w-3 h-3 text-gray-300 ml-auto group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent EOIs sidebar card (returning user) */}
          {myEois.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Recent EOIs</h3>
                <Link to="/my-eois" className="text-xs font-medium text-brand hover:underline">View all</Link>
              </div>
              <div className="flex flex-col gap-3">
                {myEois.slice(0, 3).map((eoi) => (
                  <div key={eoi.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        eoi.status === 'Approved' ? 'bg-emerald-500' :
                        eoi.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-400'
                      }`} />
                      <span className="text-sm text-gray-900 line-clamp-1 max-w-[140px]">{eoi.message}</span>
                    </div>
                    <EoiStatusBadge status={eoi.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
