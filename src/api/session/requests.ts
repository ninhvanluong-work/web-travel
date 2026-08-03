import { request } from '../axios';
import type { ApiSessionData, ApiSessionResponse, ISessionParams } from './types';

export async function getSessions(params: ISessionParams): Promise<ApiSessionData> {
  const { data } = await request.get<ApiSessionResponse>('/session', { params });
  return data.data;
}
