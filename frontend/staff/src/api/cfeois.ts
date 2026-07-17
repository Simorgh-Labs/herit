import { apiClient } from './client';
import type { Cfeoi } from '../types';

export const listCfeois = (proposalId: string): Promise<Cfeoi[]> =>
  apiClient.get('/Cfeoi', { params: { proposalId } }).then((r) => r.data);
