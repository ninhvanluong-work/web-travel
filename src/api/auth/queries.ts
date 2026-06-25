import { createMutation, createQuery } from 'react-query-kit';

import { forgotPassword, getListCourse, getUserProfile, loginRequest, registerRequest } from './requests';
import type {
  ICourse,
  IForgotPassword,
  ILoginParams,
  ILoginResponse,
  IRegisterParams,
  IRegisterResponse,
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

export const useRegisterMutation = createMutation<IRegisterResponse, IRegisterParams>({
  mutationFn: registerRequest,
});

export const useForgotPasswordMutation = createMutation<ILoginResponse, IForgotPassword>({
  mutationFn: forgotPassword,
});
