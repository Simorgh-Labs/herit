import { apiClient } from './client';
import type { User } from '../types';

// Returns the current user identified from the JWT token, with role.
// Returns 404 if no User record exists for this identity (ADR-015: staff/admin
// accounts are provisioned, never JIT-registered — a 404 here means access-denied).
export const getCurrentUser = (): Promise<User> => apiClient.get('/Users/me').then((r) => r.data);

// AdminOrSuperAdmin only — used for the admin dashboard's "Staff & admins" count.
export const listUsers = (): Promise<User[]> => apiClient.get('/Users').then((r) => r.data);

export interface CreateStaffUserPayload {
  email: string;
  fullName: string;
  organisationId: string;
}

// Provisions a Staff account. The email must match the identity this person
// signs in with through Entra — there is no JIT registration (ADR-015).
export const createStaffUser = (payload: CreateStaffUserPayload): Promise<string> =>
  apiClient.post('/Users/staff', payload).then((r) => r.data);

export interface CreateOrganisationAdminPayload {
  email: string;
  fullName: string;
  organisationId: string;
}

export const createOrganisationAdmin = (payload: CreateOrganisationAdminPayload): Promise<string> =>
  apiClient.post('/Users/organisation-admins', payload).then((r) => r.data);

export interface UpdateStaffUserPayload {
  email: string;
  fullName: string;
}

// Staff only — email and full name. Organisation isn't editable here; there is
// no update endpoint for reassigning a user's organisation.
export const updateStaffUser = (id: string, payload: UpdateStaffUserPayload): Promise<void> =>
  apiClient.put(`/Users/staff/${id}`, payload).then(() => undefined);

// Staff only. Server rejects self-delete with 403 (backstop — the UI guards this first).
export const deleteStaffUser = (id: string): Promise<void> =>
  apiClient.delete(`/Users/staff/${id}`).then(() => undefined);

// OrganisationAdmin only. Server rejects self-delete (403) and deleting the last
// remaining OrganisationAdmin (409) — both are also guarded client-side first.
export const deleteOrganisationAdmin = (id: string): Promise<void> =>
  apiClient.delete(`/Users/organisation-admins/${id}`).then(() => undefined);
