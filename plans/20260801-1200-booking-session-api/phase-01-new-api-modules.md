# Phase 01 — New API Modules

**Parent:** [plan.md](./plan.md)  
**Status:** ⏳ pending

## Overview

Create two new API directories: `src/api/session` and `src/api/booking`. These are pure additions — no existing files touched.

## Files to Create

### `src/api/session/types.ts`

```ts
export interface ApiUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  name: string;
  note: string | null;
}
export interface ApiSessionUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sessionId: string;
  unitId: string;
  price: string;
  unit?: ApiUnit;
}
export interface ApiSessionItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  travelDate: string;
  capacity: number;
  status: 'active' | 'inactive';
  sessionUnits: ApiSessionUnit[];
}
export interface ISessionParams {
  productId: string;
  fromDate: string;
  toDate: string;
  page?: number;
  pageSize?: number;
  // NOTE: keyword intentionally omitted — not supported by backend
}
export interface ApiSessionData {
  items: ApiSessionItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
export interface ApiSessionResponse {
  data: ApiSessionData;
  code: number;
  message: string;
  error: string | null;
}
```

### `src/api/session/requests.ts`

```ts
import { request } from '../axios';
import type { ApiSessionData, ApiSessionResponse, ISessionParams } from './types';

export async function getSessions(params: ISessionParams): Promise<ApiSessionData> {
  const { data } = await request.get<ApiSessionResponse>('/session', { params });
  return data.data;
}
```

### `src/api/session/queries.ts`

```ts
import { createQuery } from 'react-query-kit';
import { getSessions } from './requests';
import type { ApiSessionData, ISessionParams } from './types';

export const useSessions = createQuery<ApiSessionData, ISessionParams>({
  primaryKey: '/session',
  queryFn: ({ queryKey: [, variables] }) => getSessions(variables),
});
```

### `src/api/session/index.ts`

```ts
export * from './queries';
export * from './types';
```

---

### `src/api/booking/types.ts`

```ts
export interface IBookingPassenger {
  unitId: string;
  count: number;
}
export interface ICreateBookingPayload {
  productId: string;
  optionId: string;
  tourSessionId: string;
  pickupLocationId: string | null;
  departureId: string;
  passengers: IBookingPassenger[];
  name: string;
  email: string;
  phone: string;
  preferredChat: string | null;
}
export interface ApiBookingDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  productId: string;
  optionId: string;
  tourSessionId: string;
  pickupLocationId: string | null;
  departureId: string;
  email: string;
  phone: string;
  preferredChat: string | null;
}
export interface ApiBookingResponse {
  data: ApiBookingDetail;
  code: number;
  message: string;
  error: string | null;
}
```

### `src/api/booking/requests.ts`

```ts
import { request } from '../axios';
import type { ApiBookingDetail, ApiBookingResponse, ICreateBookingPayload } from './types';

export async function createBooking(payload: ICreateBookingPayload): Promise<ApiBookingDetail> {
  const { data } = await request.post<ApiBookingResponse>('/booking', payload);
  return data.data;
}
```

### `src/api/booking/queries.ts`

```ts
import { createMutation } from 'react-query-kit';
import { createBooking } from './requests';
import type { ApiBookingDetail, ICreateBookingPayload } from './types';

export const useCreateBooking = createMutation<ApiBookingDetail, ICreateBookingPayload>({
  mutationFn: (payload) => createBooking(payload),
});
```

### `src/api/booking/index.ts`

```ts
export * from './queries';
export * from './types';
```

## Success Criteria

- All 8 files compile with `pnpm check-types`
- No existing files modified
