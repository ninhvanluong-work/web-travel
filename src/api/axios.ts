import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import Router from 'next/router';

import { useAdminStore } from '@/stores/AdminStore';
import { useUserStore } from '@/stores/UserStore';
import { ROUTE } from '@/types';

import { refreshTokenRequest } from './auth';

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.error('[axios] NEXT_PUBLIC_API_URL is not set — API calls will fail');
}

export const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

let isRefreshing = false;
let refreshSubscribers: Array<{
  onSuccess: (token: string) => void;
  onFailure: (error: unknown) => void;
}> = [];

const flushSubscribers = (token: string) => {
  refreshSubscribers.forEach(({ onSuccess }) => onSuccess(token));
  refreshSubscribers = [];
};

const rejectSubscribers = (error: unknown) => {
  refreshSubscribers.forEach(({ onFailure }) => onFailure(error));
  refreshSubscribers = [];
};

const redirectToSignIn = () => {
  Router.replace({ pathname: ROUTE.SIGN_IN, query: { callbackUrl: Router.asPath } });
};

const onAdminRefreshToken = async (): Promise<string | null> => {
  const store = useAdminStore.getState();
  const refreshToken = store?.adminRefreshToken;

  if (!refreshToken) {
    store.logoutAdmin();
    Router.replace(ROUTE.ADMIN_LOGIN);
    return null;
  }

  try {
    const data = await refreshTokenRequest(refreshToken);
    store.setAdminStore(data);
    return data.accessToken;
  } catch (e) {
    store.logoutAdmin();
    Router.replace(ROUTE.ADMIN_LOGIN);
    return null;
  }
};

const onRefreshToken = async (): Promise<string | null> => {
  const store = useUserStore.getState();
  const refreshToken = store?.refreshToken;

  if (!refreshToken) {
    store.logout();
    redirectToSignIn();
    return null;
  }

  try {
    const data = await refreshTokenRequest(refreshToken);
    store.setStore(data);
    return data.accessToken;
  } catch (e) {
    store.logout();
    redirectToSignIn();
    return null;
  }
};

const handleSuccess = (res: AxiosResponse) => res;

const handleError = async (error: any) => {
  const originalRequest = error.config!;
  const data = error?.response?.data as any;
  const status = error?.response?.status;

  const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/');
  const isUnauthorized = status === 401 || data?.statusCode === 401;

  if (isUnauthorized && !originalRequest?._retry && !isAuthEndpoint) {
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push({
          onSuccess: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(request(originalRequest));
          },
          onFailure: (err) => reject(err),
        });
      });
    }

    isRefreshing = true;
    try {
      const isAdminRoute = Router.pathname.startsWith('/admin');
      const token = isAdminRoute ? await onAdminRefreshToken() : await onRefreshToken();
      if (!token) {
        rejectSubscribers(data?.meta || data || error);
        throw data?.meta || data || error;
      }
      flushSubscribers(token);
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return await request(originalRequest);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(data?.meta || data || error);
};

request.interceptors.response.use(handleSuccess, handleError);

request.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isAuthEndpoint = config.url?.startsWith('/auth/');
    const isLogout = config.url === '/auth/logout';

    // Do not attach the Authorization header for auth endpoints except logout
    if (isAuthEndpoint && !isLogout) {
      return config;
    }

    const isAdminRoute = Router.pathname.startsWith('/admin') || config.url?.startsWith('/admin/');
    const token = isAdminRoute ? useAdminStore.getState().adminAccessToken : useUserStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
