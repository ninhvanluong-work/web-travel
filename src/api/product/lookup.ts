import { createQuery } from 'react-query-kit';

import { getSupplierList } from '@/api/supplier/requests';
import type { LookupItem } from '@/lib/validations/product';

import { getProductList } from './requests';

async function fetchSuppliers(): Promise<LookupItem[]> {
  const { items } = await getSupplierList({ pageSize: 50 });
  return items.map((item) => ({ id: item.id, name: item.name }));
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
  staleTime: 5 * 60 * 1000,
});

export const useDestinationList = createQuery<LookupItem[], void>({
  primaryKey: '/product/lookup/destinations',
  queryFn: () => fetchDestinations(),
  staleTime: 5 * 60 * 1000,
});
