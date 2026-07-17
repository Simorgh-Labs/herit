import { apiClient } from './client';
import type { Rfp } from '../types';

export const listRfps = (): Promise<Rfp[]> => apiClient.get('/Rfps').then((r) => r.data);
