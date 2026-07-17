import { apiClient } from './client';
import type { Organisation } from '../types';

export const listOrganisations = (): Promise<Organisation[]> =>
  apiClient.get('/Organisations').then((r) => r.data);
