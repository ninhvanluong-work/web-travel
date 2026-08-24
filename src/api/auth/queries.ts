import { createMutation, createQuery } from 'react-query-kit';

import {
  adminLoginRequest,
  forgotPassword,
  getListCourse,
  getUserProfile,
  loginRequest,
  logoutRequest,
  registerRequest,
  resetPassword,
} from './requests';
import type {
  ICourse,
  IForgotPassword,
  ILoginParams,
  ILoginResponse,
  IRegisterParams,
  IRegisterResponse,
  IResetPassword,
  IUser,
} from './types';

export const useUserQuery = createQuery<IUser>({
  primaryKey: '/profile',
  queryFn: getUserProfile,
});
export const useListCourse = createQuery<ICourse[]>({
  primaryKey: '/course',
  queryFn: getListCourse,
});

export const useLoginMutation = createMutation<ILoginResponse, ILoginParams>({
  mutationFn: loginRequest,
});

export const useAdminLoginMutation = createMutation<ILoginResponse, ILoginParams>({
  mutationFn: adminLoginRequest,
});

export const useLogoutMutation = createMutation<boolean>({
  mutationFn: logoutRequest,
});

export const useRegisterMutation = createMutation<IRegisterResponse, IRegisterParams>({
  mutationFn: registerRequest,
});

export const useForgotPasswordMutation = createMutation<ILoginResponse, IForgotPassword>({
  mutationFn: forgotPassword,
});

export const useResetPasswordMutation = createMutation<ILoginResponse, IResetPassword>({
  mutationFn: resetPassword,
});
