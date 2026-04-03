import { formatKesMoney } from '@/lib/customer-preferences';

export const money = (
  n: number,
  options: {
    currency?: string | null;
    language?: string | null;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
) => formatKesMoney(n, options);
export const getCategoryLabel = (category: string) => category === 'indoor' ? 'Indoor Plants' : category === 'outdoor' ? 'Outdoor Plants' : category === 'pots' ? 'Pots Only' : 'Studio Collection';
