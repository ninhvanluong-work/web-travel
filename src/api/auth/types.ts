// Login
export interface ILoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ILoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken?: string;
}

// Register
export interface IRegisterParams {
  email: string;
  password: string;
  role: 'normal' | 'tour_guide';
}

export interface IRegisterResponse extends ILoginResponse {}

export interface IRefreshTokenApiResponse {
  data: {
    token: string;
    refreshToken: string;
    user: IUser;
  };
  code: number;
  error: string | null;
  message: string;
}

export interface IUser {
  id: string;
  uuid?: string;
  email: string;
  name?: string | null;
  firstName?: string;
  lastName?: string;
  company?: string;
  emailVerifiedAt?: string;
  role?: 'guide' | 'tour_guide' | 'user' | 'normal';
  tourGuideId?: string;
}

export interface ILoginApiResponse {
  data: {
    token: string;
    refreshToken: string;
    user: IUser;
  };
  code: number;
  message: string;
  error: string | null;
}
export interface IForgotPassword {
  email: string;
}
export interface IResetPassword {
  token: string;
  newPassword: string;
}
export interface ICourse {
  id: number;
  uuid: string;
  name: string;
  description: string;
  image: string;
  platformExternalUrl: string;
  platformId: number;
  customId: number;
  courseUrl: string;
  courseToken: string;
  progress: string;
}
export interface IProfile {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}
export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}
