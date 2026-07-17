export type UserRole = 'Expat' | 'Staff' | 'OrganisationAdmin' | 'SuperAdmin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export const STAFF_ROLES: readonly UserRole[] = ['Staff', 'OrganisationAdmin', 'SuperAdmin'];

export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}
