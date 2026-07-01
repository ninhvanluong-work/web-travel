import { request } from '../axios';
import type {
  IChangePassword,
  ICourse,
  IForgotPassword,
  ILoginApiResponse,
  ILoginParams,
  ILoginResponse,
  IProfile,
  IRefreshTokenApiResponse,
  IRegisterParams,
  IRegisterResponse,
  IResetPassword,
  IUser,
} from './types';

export const loginRequest = async (params: ILoginParams): Promise<ILoginResponse> => {
  const { data: res }: { data: ILoginApiResponse } = await request({
    url: '/auth/login',
    method: 'POST',
    data: params,
  });

  const { token, refreshToken, user } = res.data;

  return { accessToken: token, refreshToken, user };
};

export const logoutRequest = async (): Promise<boolean> => {
  const { data } = await request({
    url: '/authentication/log-out',
    method: 'POST',
  });

  return data;
};

export const registerRequest = async (params: IRegisterParams): Promise<IRegisterResponse> => {
  const { data } = await request({
    url: '/auth/register',
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
    url: '/auth/forgot-password',
    method: 'POST',
    data: params,
  });

  return data;
};
export const resetPassword = async (params: IResetPassword): Promise<ILoginResponse> => {
  const { data } = await request({
    url: '/auth/reset-password',
    method: 'POST',
    data: params,
  });

  return data;
};

export const refreshTokenRequest = async (refreshToken: string): Promise<ILoginResponse> => {
  const { data: res }: { data: IRefreshTokenApiResponse } = await request({
    url: '/auth/access-token/renew',
    method: 'POST',
    data: { refreshToken },
    timeout: 10000,
  });

  const { token: accessToken, refreshToken: newRefreshToken, user } = res.data;
  return { accessToken, refreshToken: newRefreshToken, user };
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
