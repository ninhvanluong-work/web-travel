import { request } from '../axios';
import type { ApiTourSessionData, ApiTourSessionResponse, ITourSessionParams } from './types';

export async function getTourSessions(params: ITourSessionParams): Promise<ApiTourSessionData> {
  const { data } = await request.get<ApiTourSessionResponse>('/tour-session', { params });
  return data.data;
}
