import axios from 'axios';

import { env } from '@/lib/const';

import { request } from '../axios';
import { MOCK_GUIDE_ACCOUNTS, MOCK_GUIDE_FALLBACK } from './mock-guides';
import type {
  IChangePassword,
  ICourse,
  IForgotPassword,
  ILoginParams,
  ILoginResponse,
  IProfile,
  IRegisterParams,
  IRegisterResponse,
  IResetPassword,
  IUser,
} from './types';

export const loginRequest = async (params: ILoginParams): Promise<ILoginResponse> => {
  const emailLower = params.email.toLowerCase();
  const mockGuide = MOCK_GUIDE_ACCOUNTS[emailLower];

  if (mockGuide || emailLower.includes('guide')) {
    const guide = mockGuide ?? MOCK_GUIDE_FALLBACK;
    return {
      accessToken: 'mock-guide-access-token',
      refreshToken: 'mock-guide-refresh-token',
      user: {
        id: `mock-${emailLower}`,
        uuid: `mock-uuid-${emailLower}`,
        email: params.email,
        firstName: guide.firstName,
        lastName: guide.lastName,
        company: 'VVV Travel',
        emailVerifiedAt: new Date().toISOString(),
        role: 'guide',
        tourGuideId: guide.tourGuideId,
      },
    };
  }

  const { data } = await request({
    url: '/authentication/log-in',
    method: 'POST',
    data: params,
  });

  return data;
};

export const logoutRequest = async (): Promise<boolean> => {
  const { data } = await request({
    url: '/authentication/log-out',
    method: 'POST',
  });

  return data;
};

export const refetchTokenRequest = async (): Promise<ILoginResponse> => {
  const { data } = await request({
    url: '/authentication/refresh',
    method: 'GET',
  });

  return data;
};

export const registerRequest = async (params: IRegisterParams): Promise<IRegisterResponse> => {
  const { data } = await request({
    url: '/authentication/register',
    method: 'POST',
    data: params,
  });

  return data;
};

export const getUserProfile = async (): Promise<IUser> => {
  const { data } = await request({
    url: '/users/me',
    method: 'GET',
  });
  return data;
};

export const getUserProfileWithToken = async (token: string): Promise<IUser> => {
  const { data } = await request({
    url: '/user/me',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
export const forgotPassword = async (params: IForgotPassword): Promise<ILoginResponse> => {
  const { data } = await request({
    url: '/authentication/forgot-password',
    method: 'POST',
    data: params,
  });

  return data;
};
export const resetPassword = async (params: IResetPassword): Promise<ILoginResponse> => {
  const { data } = await request({
    url: '/authentication/reset-password',
    method: 'POST',
    data: params,
  });

  return data;
};

export const refreshTokenRequest = async (refreshToken: string): Promise<Omit<ILoginResponse, 'refreshToken'>> => {
  const { data } = await axios.get(`${env.API_URL}/authentication/refresh`, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  return data;
};
export const getListCourse = async (): Promise<ICourse[]> => {
  const { data } = await request({
    url: '/user-courses/courses',
    method: 'GET',
  });
  return data;
};
export const updateProfile = async (body: IProfile): Promise<ILoginResponse> => {
  const { data } = await request({
    url: '/users/profile',
    method: 'PUT',
    data: body,
  });

  return data;
};
export const changePassword = async (body: IChangePassword): Promise<ILoginResponse> => {
  const { data } = await request({
    url: '/authentication/change-password',
    method: 'POST',
    data: body,
  });

  return data;
};
