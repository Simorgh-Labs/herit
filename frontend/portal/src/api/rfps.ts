import { apiClient } from './client';
import type { Rfp } from '../types';

export const listRfps = (): Promise<Rfp[]> =>
  apiClient.get('/Rfps').then((r) => r.data);

export const getRfpById = (id: string): Promise<Rfp> =>
  apiClient.get(`/Rfps/${id}`).then((r) => r.data);
