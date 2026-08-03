# Phase 02 — Extend Product API

**Parent:** [plan.md](./plan.md)  
**Depends on:** Phase 01  
**Status:** ⏳ pending

## Overview

Add booking config types + request + query to existing `src/api/product/` files.

## Changes

### `src/api/product/types.ts` — APPEND these interfaces (do not touch existing)

```ts
export interface ApiProductBookingDepartureTime {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  time: string;
  label: string;
  order: number;
  isActive: boolean;
  note: string | null;
}
export interface ApiProductBookingPickupLocation {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  name: string;
  address: string | null;
  isPopular: boolean;
  mapUrl: string | null;
  order: number;
}
export interface ApiProductBookingOption {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  description: string | null;
  day: number;
  night: number;
  isDefault: boolean;
  status: 'active' | 'inactive';
  order: number;
  currency: string;
  productId: string;
  // allowUnit intentionally omitted — unused field
}
export interface ApiProductBookingData {
  departureTimes: ApiProductBookingDepartureTime[];
  pickupLocations: ApiProductBookingPickupLocation[];
  options: ApiProductBookingOption[];
}
export interface ApiProductBookingResponse {
  data: ApiProductBookingData;
  code: number;
  message: string;
  error: string | null;
}
```

### `src/api/product/requests.ts` — ADD one function at end of file

```ts
export async function getProductBookingDetail(productId: string): Promise<ApiProductBookingData> {
  const { data } = await request.get<ApiProductBookingResponse>(`/product/${productId}/booking`);
  return data.data;
}
```

Also add `ApiProductBookingData`, `ApiProductBookingResponse` to the import from `./types`.

### `src/api/product/queries.ts` — ADD one query at end of file

```ts
export const useProductBookingDetail = createQuery<ApiProductBookingData, { id: string }>({
  primaryKey: '/product/booking',
  queryFn: ({ queryKey: [, { id }] }) => getProductBookingDetail(id),
});
```

Also add `ApiProductBookingData` to imports from `./types` and `getProductBookingDetail` from `./requests`.

## Success Criteria

- `pnpm check-types` passes
- Existing product queries unaffected
