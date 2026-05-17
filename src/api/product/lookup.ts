/**
 * Since the backend has no dedicated /supplier or /destination endpoints,
 * we derive unique suppliers & destinations by fetching a large page of products.
 */
import { createQuery } from 'react-query-kit';

import type { LookupItem } from '@/lib/validations/product';

import { getProductList } from './requests';

async function fetchSuppliers(): Promise<LookupItem[]> {
  // NOTE: backend caps pageSize at 50 — if total products > 50 some suppliers may be missing
  const { items } = await getProductList({ pageSize: 50 });
  const seen = new Set<string>();
  return items
    .filter((p) => p.supplier !== null)
    .reduce<LookupItem[]>((acc, p) => {
      if (!seen.has(p.supplier!.id)) {
        seen.add(p.supplier!.id);
        acc.push({ id: p.supplier!.id, name: p.supplier!.name });
      }
      return acc;
    }, []);
}

async function fetchDestinations(): Promise<LookupItem[]> {
  // NOTE: backend caps pageSize at 50 — if total products > 50 some destinations may be missing
  const { items } = await getProductList({ pageSize: 50 });
  const seen = new Set<string>();
  return items
    .filter((p) => p.destination !== null)
    .reduce<LookupItem[]>((acc, p) => {
      if (!seen.has(p.destination!.id)) {
        seen.add(p.destination!.id);
        acc.push({ id: p.destination!.id, name: p.destination!.name });
      }
      return acc;
    }, []);
}

export const useSupplierList = createQuery<LookupItem[], void>({
  primaryKey: '/product/lookup/suppliers',
  queryFn: () => fetchSuppliers(),
  staleTime: 5 * 60 * 1000, // 5 min cache
});

export const useDestinationList = createQuery<LookupItem[], void>({
  primaryKey: '/product/lookup/destinations',
  queryFn: () => fetchDestinations(),
  staleTime: 5 * 60 * 1000,
});
