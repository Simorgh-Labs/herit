import { useQuery } from '@tanstack/react-query';
import { listRfps } from '../../api/rfps';
import { listProposals } from '../../api/proposals';
import { listOrganisations } from '../../api/organisations';
import { listUsers } from '../../api/users';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { isAdminRole, isStaffRole, roleLabel, type RfpStatus, type ProposalStatus } from '../../types';
import StatCard from '../../components/StatCard';

function countByStatus<T extends string>(items: { status: T }[] | undefined, status: T): number {
  return items?.filter((item) => item.status === status).length ?? 0;
}

const RFP_STATUSES: RfpStatus[] = ['Draft', 'Approved', 'Published'];

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const isAdmin = !!user && isAdminRole(user.role);

  const { data: rfps } = useQuery({ queryKey: ['rfps'], queryFn: listRfps });
  const { data: proposals } = useQuery({ queryKey: ['proposals'], queryFn: listProposals });
  const { data: organisations } = useQuery({
    queryKey: ['organisations'],
    queryFn: listOrganisations,
    enabled: isAdmin,
  });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: listUsers, enabled: isAdmin });

  const submittedCount = countByStatus<ProposalStatus>(proposals, 'Submitted');
  const underReviewCount = countByStatus<ProposalStatus>(proposals, 'UnderReview');

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8 pb-16">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Welcome back{user ? `, ${user.fullName}` : ''}
        </h1>
        <p className="text-sm text-neutral-500">
          {user ? roleLabel(user.role) : ''} · counts below are computed from the current list endpoints, not a
          stats API — nothing here is a trend or a "this week" figure.
        </p>
      </div>

      <section className="mb-7">
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">RFPs by status</h2>
        <div className="flex gap-3 flex-wrap">
          {RFP_STATUSES.map((status) => (
            <StatCard
              key={status}
              value={countByStatus<RfpStatus>(rfps, status)}
              label={status}
              to={`/rfps?status=${status}`}
            />
          ))}
        </div>
      </section>

      <section className="mb-7">
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">Proposals awaiting review</h2>
        <div className="flex gap-3 flex-wrap">
          <StatCard value={submittedCount} label="Submitted" to="/proposals?status=Submitted" tone="amber" />
          <StatCard value={underReviewCount} label="Under Review" to="/proposals?status=UnderReview" tone="orange" />
        </div>
      </section>

      {isAdmin && (
        <section className="mb-7">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Organisations &amp; users</h2>
          <div className="flex gap-3 flex-wrap mb-2.5">
            <StatCard value={organisations?.length ?? 0} label="Organisations" to="/organisations" />
            <StatCard
              value={users?.filter((u) => isStaffRole(u.role)).length ?? 0}
              label="Staff & admins"
              to="/users"
            />
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            These counts span every organisation on the platform. Organisation-scoped permissions don't exist yet —
            any admin sees and manages all organisations, not just their own.
          </p>
        </section>
      )}
    </div>
  );
}
