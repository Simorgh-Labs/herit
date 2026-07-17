export type UserRole = 'Expat' | 'Staff' | 'OrganisationAdmin' | 'SuperAdmin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organisationId?: string;
}

export const STAFF_ROLES: readonly UserRole[] = ['Staff', 'OrganisationAdmin', 'SuperAdmin'];
export const ADMIN_ROLES: readonly UserRole[] = ['OrganisationAdmin', 'SuperAdmin'];

export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

const ROLE_LABELS: Record<UserRole, string> = {
  Expat: 'Expat',
  Staff: 'Staff',
  OrganisationAdmin: 'Organisation Admin',
  SuperAdmin: 'Super Admin',
};

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role];
}

export type RfpStatus = 'Draft' | 'Approved' | 'Published';

export interface Rfp {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  status: RfpStatus;
  organisationId: string;
  authorId: string;
  tags?: string;
}

export type ProposalStatus =
  | 'Ideation'
  | 'Resourcing'
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Withdrawn';

export type ProposalVisibility = 'Private' | 'Shared' | 'Public';

export interface Proposal {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  status: ProposalStatus;
  visibility: ProposalVisibility;
  authorId: string;
  organisationId: string;
  rfpId?: string;
}

export interface Organisation {
  id: string;
  name: string;
  parentId?: string;
}

export type CfeoiStatus = 'Open' | 'Closed';

export interface Cfeoi {
  id: string;
  title: string;
  description: string;
  proposalId: string;
  status: CfeoiStatus;
  tags?: string;
}

export type EoiStatus = 'Pending' | 'Approved' | 'Rejected';

export type EoiVisibility = 'Private' | 'Shared';

export interface Eoi {
  id: string;
  message: string;
  status: EoiStatus;
  visibility: EoiVisibility;
  cfeoiId: string;
  submittedById: string;
  submitterName: string;
  submitterEmail?: string;
}
