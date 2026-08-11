import { createMutation, createQuery } from 'react-query-kit';

import {
  createSession,
  createSessionRange,
  deleteSession,
  getSessionById,
  getSessions,
  updateSession,
} from './requests';
import type {
  CreateSessionPayload,
  CreateSessionRangePayload,
  ISession,
  ISessionListResult,
  ISessionParams,
  UpdateSessionPayload,
} from './types';

export const useSessionList = createQuery<ISessionListResult, ISessionParams>({
  primaryKey: '/session',
  queryFn: ({ queryKey: [, variables] }) => getSessions(variables),
  staleTime: 0,
});

export const useSessionById = createQuery<ISession, { id: string }>({
  primaryKey: '/session/detail',
  queryFn: ({ queryKey: [, { id }] }) => getSessionById(id),
  staleTime: 0,
});

export const useCreateSession = createMutation<ISession, CreateSessionPayload>({
  mutationFn: (payload) => createSession(payload),
});

export const useCreateSessionRange = createMutation<ISession[], CreateSessionRangePayload>({
  mutationFn: (payload) => createSessionRange(payload),
});

export const useUpdateSession = createMutation<ISession, { id: string; payload: UpdateSessionPayload }>({
  mutationFn: ({ id, payload }) => updateSession(id, payload),
});

export const useDeleteSession = createMutation<void, { id: string }>({
  mutationFn: ({ id }) => deleteSession(id),
});
