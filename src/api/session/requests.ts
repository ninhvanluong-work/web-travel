import { request } from '../axios';
import type {
  ApiSessionDetailResponse,
  ApiSessionItem,
  ApiSessionListResponse,
  ApiSessionRangeResponse,
  CreateSessionPayload,
  CreateSessionRangePayload,
  ISession,
  ISessionListResult,
  ISessionParams,
  ISessionUnit,
  IUnit,
  UpdateSessionPayload,
} from './types';

const toUnit = (raw: NonNullable<ApiSessionItem['sessionUnits'][number]['unit']>): IUnit => ({
  id: raw.id,
  name: raw.name,
  note: raw.note,
  productId: raw.productId,
});

const toSessionUnit = (raw: ApiSessionItem['sessionUnits'][number]): ISessionUnit => ({
  id: raw.id,
  sessionId: raw.sessionId,
  unitId: raw.unitId,
  price: parseFloat(raw.price),
  unit: raw.unit ? toUnit(raw.unit) : undefined,
});

const toSession = (raw: ApiSessionItem): ISession => ({
  id: raw.id,
  productId: raw.productId,
  travelDate: raw.travelDate.slice(0, 10),
  capacity: raw.capacity,
  status: raw.status,
  sessionUnits: raw.sessionUnits.map(toSessionUnit),
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

export async function getSessions(params: ISessionParams): Promise<ISessionListResult> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const { data } = await request.get<ApiSessionListResponse>('/session', { params: cleanParams });
  return {
    items: data.data.items.map(toSession),
    pagination: data.data.pagination,
  };
}

export async function getSessionById(id: string): Promise<ISession> {
  const { data } = await request.get<ApiSessionDetailResponse>(`/session/${id}`);
  return toSession(data.data);
}

export async function createSession(payload: CreateSessionPayload): Promise<ISession> {
  const { data } = await request.post<ApiSessionDetailResponse>('/session', payload);
  return toSession(data.data);
}

export async function createSessionRange(payload: CreateSessionRangePayload): Promise<ISession[]> {
  const { data } = await request.post<ApiSessionRangeResponse>('/session/range', payload);
  return data.data.map(toSession);
}

export async function updateSession(id: string, payload: UpdateSessionPayload): Promise<ISession> {
  const { data } = await request.put<ApiSessionDetailResponse>(`/session/${id}`, payload);
  return toSession(data.data);
}

export async function deleteSession(id: string): Promise<void> {
  await request.delete<ApiSessionDetailResponse>(`/session/${id}`);
}
