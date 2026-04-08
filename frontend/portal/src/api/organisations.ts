import { apiClient } from './client';
import type { Organisation } from '../types';

export const listOrganisations = (): Promise<Organisation[]> =>
  apiClient.get('/Organisations').then((r) => r.data);

export const getOrganisationById = (id: string): Promise<Organisation> =>
  apiClient.get(`/Organisations/${id}`).then((r) => r.data);
