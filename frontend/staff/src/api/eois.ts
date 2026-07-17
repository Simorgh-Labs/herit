import { apiClient } from './client';
import type { Eoi } from '../types';

export const listEoisByCfeoi = (cfeoiId: string): Promise<Eoi[]> =>
  apiClient.get('/Eoi', { params: { cfeoiId } }).then((r) => r.data);
