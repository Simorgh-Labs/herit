import { apiClient } from './client';
import type { User } from '../types';

// Returns the current user identified from the JWT token, with role.
// Returns 404 if no User record exists for this identity (ADR-015: staff/admin
// accounts are provisioned, never JIT-registered — a 404 here means access-denied).
export const getCurrentUser = (): Promise<User> => apiClient.get('/Users/me').then((r) => r.data);
