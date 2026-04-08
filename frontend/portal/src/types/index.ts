// --- Enums ---

export type RfpStatus = 'Draft' | 'Approved' | 'Published';

export type ProposalStatus =
  | 'Ideation'
  | 'Resourcing'
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Withdrawn';

export type ProposalVisibility = 'Private' | 'Shared' | 'Public';

export type CfeoiStatus = 'Open' | 'Closed';

export type CfeoiResourceType = 'Human' | 'NonHuman';

export type EoiStatus = 'Pending' | 'Approved' | 'Rejected';

export type EoiVisibility = 'Private' | 'Shared';

export type UserRole = 'Expat' | 'Staff';

// --- Entities ---

export interface Organisation {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  nationality?: string;
  location?: string;
  expertiseTags?: string;
  termsAcceptedAt?: string; // ISO date string
}

export interface Rfp {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  status: RfpStatus;
  organisationId: string;
  authorId: string;
}

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

export interface Cfeoi {
  id: string;
  title: string; // Short category label (e.g. "Technical Advisory")
  description: string;
  resourceType: CfeoiResourceType;
  proposalId: string;
  status: CfeoiStatus;
  roleTitle: string; // Specific role name (e.g. "Blockchain Architect")
  skills: string; // Comma-separated
  slots: number;
  durationWeeks?: number;
  location?: string;
  compensation?: string;
  deadline?: string; // ISO date string (DateOnly from backend)
  externalLinks?: string;
}

export interface Eoi {
  id: string;
  message: string;
  status: EoiStatus;
  visibility: EoiVisibility;
  submittedById: string;
  cfeoiId: string;
}

// --- API request types ---

export interface CreateProposalRequest {
  title: string;
  shortDescription: string;
  longDescription: string;
  organisationId: string;
  rfpId?: string;
}

export interface UpdateProposalRequest {
  title: string;
  shortDescription: string;
  longDescription: string;
}

export interface PublishCfeoiRequest {
  title: string;
  description: string;
  resourceType: CfeoiResourceType;
  proposalId: string;
  roleTitle: string;
  skills: string;
  slots: number;
  durationWeeks?: number;
  location?: string;
  compensation?: string;
  deadline?: string;
  externalLinks?: string;
}

export interface SubmitEoiRequest {
  message: string;
  cfeoiId: string;
}

export interface RegisterExpatRequest {
  externalId: string;
  email: string;
  fullName: string;
  nationality?: string;
  location?: string;
  expertiseTags?: string;
  termsAcceptedAt: string; // ISO date string
}
