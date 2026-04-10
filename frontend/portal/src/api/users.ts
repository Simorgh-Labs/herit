import { apiClient } from './client';
import type { User, RegisterExpatRequest } from '../types';

export const listUsers = (): Promise<User[]> =>
  apiClient.get('/Users').then((r) => r.data);

export const getUserById = (id: string): Promise<User> =>
  apiClient.get(`/Users/${id}`).then((r) => r.data);

// Returns the current user identified from the JWT token.
// Returns 404 if the user has not yet registered in Herit.
export const getCurrentUser = (): Promise<User> =>
  apiClient.get('/Users/me').then((r) => r.data);

export const updateUserProfile = (id: string, data: Partial<RegisterExpatRequest>): Promise<void> =>
  apiClient.patch(`/Users/${id}/profile`, data).then((r) => r.data);
