import { apiClient } from './client';
import type { Organisation } from '../types';

export const listOrganisations = (): Promise<Organisation[]> =>
  apiClient.get('/Organisations').then((r) => r.data);

export interface CreateOrganisationPayload {
  name: string;
  parentId?: string;
}

export const createOrganisation = (payload: CreateOrganisationPayload): Promise<string> =>
  apiClient.post('/Organisations', payload).then((r) => r.data);

export const updateOrganisation = (id: string, name: string): Promise<void> =>
  apiClient.put(`/Organisations/${id}`, { name }).then(() => undefined);

export const deleteOrganisation = (id: string): Promise<void> =>
  apiClient.delete(`/Organisations/${id}`).then(() => undefined);
