# 🔐 Auth Pages Specification — web-travel

> **Dự án**: `web-travel` — Next.js Travel Frontend  
> **Ngày viết spec**: 2026-06-17  
> **Mục đích**: Thiết kế và cài đặt 3 màn hình xác thực (Sign In, Sign Up, Forgot Password) theo đúng design system hiện tại của dự án.

---

## 🧭 Nguyên tắc thiết kế chung

Tất cả 3 màn hình auth phải **tuân theo design system hiện tại** của `web-travel`:

| Yếu tố           | Quy định                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Viewport**     | Mobile-first, `max-w-[430px]`, `h-[100dvh]`, tương tự các trang hiện có                                                                       |
| **Layout shell** | Dùng `MainLayout` (`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[100dvh] max-h-[932px] overflow-hidden bg-white shadow-2xl`) |
| **Font**         | `font-dinpro` (DINPro) — hệ thống font hiện tại của dự án                                                                                     |
| **Màu chủ đạo**  | `neutral-black` (tương đương `#0D0D0D`) cho button CTA chính; link màu underline neutral                                                      |
| **Input**        | Component `<Input>` hiện có — `h-14`, `rounded-lg`, `border`, `focus-visible:border-brand-300`                                                |
| **Button CTA**   | Dùng `<button>` native hoặc `<Button>` — full-width, `h-14`, `rounded-lg`, `bg-neutral-black text-white` (giống `action-bar.tsx`)             |
| **Scroll**       | Trang dài hơn viewport thì `overflow-y-auto scrollbar-hide`                                                                                   |
| **i18n**         | `useTranslation('authPage')` — namespace mới `authPage.json` (en + vi)                                                                        |
| **Animation**    | `framer-motion` — fade-up nhẹ khi mount, giống `GuideProfilePage`                                                                             |

> [!IMPORTANT] > **Không dùng màu xanh `#3B5BDB` của ecom cũ.** CTA button phải theo dark neutral style của hệ thống hiện tại (`bg-neutral-black`). Social OAuth buttons dùng border outline trắng/neutral.

---

## 📁 Cấu trúc file cần tạo mới

```
src/
├── pages/
│   ├── [locale]/
│   │   ├── sign-in.tsx            # Route /[locale]/sign-in — getStaticProps loads ['common', 'authPage']
│   │   ├── sign-up.tsx            # Route /[locale]/sign-up
│   │   └── forgot-password.tsx    # Route /[locale]/forgot-password
├── modules/
│   ├── SignInPage/
│   │   └── index.tsx              # UI component trang Sign In
│   ├── SignUpPage/
│   │   └── index.tsx              # UI component trang Sign Up
│   └── ForgotPasswordPage/
│       └── index.tsx              # UI component trang Forgot Password
├── api/
│   └── auth/
│       ├── index.ts               # Re-export
│       ├── types.ts               # TypeScript interfaces
│       ├── requests.ts            # Axios API calls
│       └── queries.ts             # React Query mutations
├── lib/
│   └── validations/
│       └── auth.ts                # Zod schemas: loginSchema, registerSchema, forgotSchema

public/
└── locales/
    ├── en/
    │   └── authPage.json
    └── vi/
        └── authPage.json
```

---

## 🔤 Locale file spec — `authPage.json`

### `public/locales/en/authPage.json`

```json
{
  "signIn": {
    "title": "Sign In",
    "subtitle": "Enter your email and password to sign in",
    "emailLabel": "Email",
    "emailPlaceholder": "info@gmail.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "Enter your password",
    "keepLoggedIn": "Keep me logged in",
    "forgotPassword": "Forgot password?",
    "submitButton": "Sign In",
    "orDivider": "Or",
    "googleButton": "Sign in with Google",
    "twitterButton": "Sign in with X",
    "noAccount": "Don't have an account?",
    "signUpLink": "Sign Up",
    "errorInvalid": "Incorrect email or password.",
    "errorGeneric": "Something went wrong. Please try again."
  },
  "signUp": {
    "title": "Sign Up",
    "subtitle": "Enter your email and password to sign up",
    "firstNameLabel": "First Name",
    "firstNamePlaceholder": "Enter your first name",
    "lastNameLabel": "Last Name",
    "lastNamePlaceholder": "Enter your last name",
    "emailLabel": "Email",
    "emailPlaceholder": "Enter your email",
    "passwordLabel": "Password",
    "passwordPlaceholder": "Enter your password",
    "agreeText": "By creating an account means you agree to the",
    "termsLink": "Terms and Conditions",
    "andText": ", and our",
    "privacyLink": "Privacy Policy",
    "submitButton": "Sign Up",
    "orDivider": "Or",
    "googleButton": "Sign up with Google",
    "twitterButton": "Sign up with X",
    "haveAccount": "Already have an account?",
    "signInLink": "Sign In",
    "errorEmailTaken": "This email is already registered.",
    "errorGeneric": "Could not create account. Please try again."
  },
  "forgotPassword": {
    "title": "Forgot Your Password?",
    "subtitle": "Enter the email address linked to your account, and we'll send you a link to reset your password.",
    "emailLabel": "Email",
    "emailPlaceholder": "Enter your email",
    "submitButton": "Send Reset Link",
    "successMessage": "Check your inbox! A reset link has been sent.",
    "rememberPassword": "Wait, I remember my password...",
    "clickHere": "Click here",
    "errorNotFound": "No account found with this email.",
    "errorGeneric": "Could not send reset link. Please try again."
  }
}
```

### `public/locales/vi/authPage.json`

```json
{
  "signIn": {
    "title": "Đăng nhập",
    "subtitle": "Nhập email và mật khẩu để đăng nhập",
    "emailLabel": "Email",
    "emailPlaceholder": "info@gmail.com",
    "passwordLabel": "Mật khẩu",
    "passwordPlaceholder": "Nhập mật khẩu",
    "keepLoggedIn": "Duy trì đăng nhập",
    "forgotPassword": "Quên mật khẩu?",
    "submitButton": "Đăng nhập",
    "orDivider": "Hoặc",
    "googleButton": "Đăng nhập với Google",
    "twitterButton": "Đăng nhập với X",
    "noAccount": "Chưa có tài khoản?",
    "signUpLink": "Đăng ký",
    "errorInvalid": "Email hoặc mật khẩu không đúng.",
    "errorGeneric": "Đã xảy ra lỗi. Vui lòng thử lại."
  },
  "signUp": {
    "title": "Đăng ký",
    "subtitle": "Nhập email và mật khẩu để tạo tài khoản",
    "firstNameLabel": "Họ",
    "firstNamePlaceholder": "Nhập họ của bạn",
    "lastNameLabel": "Tên",
    "lastNamePlaceholder": "Nhập tên của bạn",
    "emailLabel": "Email",
    "emailPlaceholder": "Nhập email của bạn",
    "passwordLabel": "Mật khẩu",
    "passwordPlaceholder": "Nhập mật khẩu",
    "agreeText": "Tạo tài khoản đồng nghĩa bạn đồng ý với",
    "termsLink": "Điều khoản sử dụng",
    "andText": "và",
    "privacyLink": "Chính sách bảo mật",
    "submitButton": "Đăng ký",
    "orDivider": "Hoặc",
    "googleButton": "Đăng ký với Google",
    "twitterButton": "Đăng ký với X",
    "haveAccount": "Đã có tài khoản?",
    "signInLink": "Đăng nhập",
    "errorEmailTaken": "Email này đã được đăng ký.",
    "errorGeneric": "Không thể tạo tài khoản. Vui lòng thử lại."
  },
  "forgotPassword": {
    "title": "Quên mật khẩu?",
    "subtitle": "Nhập địa chỉ email liên kết với tài khoản và chúng tôi sẽ gửi link đặt lại mật khẩu.",
    "emailLabel": "Email",
    "emailPlaceholder": "Nhập email của bạn",
    "submitButton": "Gửi link đặt lại",
    "successMessage": "Kiểm tra hộp thư! Link đặt lại đã được gửi.",
    "rememberPassword": "À nhớ ra mật khẩu rồi...",
    "clickHere": "Quay lại",
    "errorNotFound": "Không tìm thấy tài khoản với email này.",
    "errorGeneric": "Không thể gửi link. Vui lòng thử lại."
  }
}
```

---

## 📐 Screen 1 — Sign In

### Layout tổng thể

```
┌─────────────────────────────┐  ← max-w-[430px], h-[100dvh]
│  padding: px-[30px] pt-12  │
│                             │
│  Sign In               h1  │  ← text-[28px] font-bold font-dinpro
│  subtitle              p   │  ← text-[13px] text-neutral-500
│                             │
│  [G] Sign in with Google   │  ← OAuth button (outline, w-full, h-[48px])
│  [X] Sign in with X        │  ← OAuth button (outline, w-full, h-[48px])
│                             │
│       ────── Or ──────      │  ← divider với text centered
│                             │
│  Email *                   │  ← label: text-[13px] font-medium
│  ┌──────────────────────┐  │
│  │  info@gmail.com      │  │  ← Input size="default" (h-14, rounded-lg)
│  └──────────────────────┘  │
│                             │
│  Password *                │  ← label: text-[13px] font-medium
│  ┌────────────────────👁 ┐  │
│  │  Enter your password  │  │  ← Input type="password" — toggle eye icon
│  └──────────────────────┘  │
│                             │
│  [✓] Keep me logged in  Forgot password? │
│                             │
│  ┌──────────────────────┐  │
│  │       Sign In        │  │  ← CTA: h-14, bg-neutral-black, text-white, rounded-lg, w-full
│  └──────────────────────┘  │
│                             │
│  Don't have account? Sign Up│ ← text-[13px], Sign Up: underline
└─────────────────────────────┘
```

### Chi tiết từng element

#### Heading block

- **Heading `<h1>`**: `text-[28px] font-bold tracking-[-0.5px] text-neutral-900 font-dinpro`
- **Subtitle `<p>`**: `text-[13px] text-neutral-500 mt-1 font-dinpro`
- Khoảng cách dưới heading block: `mb-7`

#### OAuth Buttons (Google & X)

- Container: `flex gap-3 w-full` — hai button chia đôi theo chiều ngang (mỗi button `flex-1`)
- Style button: `flex items-center justify-center gap-2 h-[48px] rounded-lg border border-neutral-200 bg-white text-[13px] font-medium text-neutral-800 font-dinpro hover:bg-neutral-50 active:scale-[0.98] transition-all`
- Icon Google: SVG chính thức (4 màu G logo), `w-[18px] h-[18px]`
- Icon X (Twitter): SVG logo X đen, `w-[16px] h-[16px]`
- Không có màu nền, chỉ border outline

#### Divider "Or"

- `flex items-center gap-3 my-5`
- Line: `flex-1 h-px bg-neutral-200`
- Text: `text-[12px] text-neutral-400 font-dinpro`

#### Form fields

- Label: `block text-[13px] font-medium text-neutral-800 mb-1.5 font-dinpro`
- Required asterisk `*`: `text-red-500 ml-0.5`
- Input: dùng component `<Input>` hiện có — `size="default"` (h-14), `variant="default"`, `fullWidth`
- Password input: `type="password"` — component `<Input>` tự handle toggle eye icon (đã có sẵn)
- Error message: `text-[11px] text-red-500 mt-1` — hiển thị dưới field khi validation fail
- Khoảng cách giữa các field group: `mb-4`

#### "Keep logged in" + "Forgot password?" row

- Container: `flex items-center justify-between mt-2 mb-5`
- Checkbox + label trái: dùng `<Checkbox>` component Radix hiện có + `<label>` `text-[12px] text-neutral-700`
- "Forgot password?" link phải: `text-[12px] text-neutral-black underline underline-offset-2 font-medium hover:opacity-60`
- Navigate tới `/[locale]/forgot-password`

#### CTA Button "Sign In"

- `<button type="submit">` — `w-full h-14 rounded-lg bg-neutral-black text-white text-[15px] font-medium font-dinpro`
- Hover: `hover:opacity-90`
- Active: `active:scale-[0.98]`
- Loading state: hiển thị spinner, text đổi thành "Signing in..." — disable button
- Transition: `transition-all duration-150`

#### Footer link "Don't have an account?"

- Container: `text-center mt-5`
- Text: `text-[13px] text-neutral-500 font-dinpro`
- Link "Sign Up": `text-neutral-black underline underline-offset-2 font-medium`
- Navigate tới `/[locale]/sign-up`

### Animation

- Dùng `framer-motion` `<motion.div>` wrap toàn bộ content
- `initial={{ opacity: 0, y: 16 }}` → `animate={{ opacity: 1, y: 0 }}`
- `transition={{ duration: 0.4, ease: 'easeOut' }}`

### Validation (Zod)

```typescript
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(false).optional(),
});
export type LoginSchema = z.infer<typeof loginSchema>;
```

### States & UX

| State                   | Behavior                                                     |
| ----------------------- | ------------------------------------------------------------ |
| **Idle**                | Form bình thường                                             |
| **Typing**              | Validation on-blur (không realtime để tránh annoying)        |
| **Submitting**          | Button disabled + spinner, inputs disabled                   |
| **Error (wrong creds)** | Toast alert lỗi via `useAlertStore` (giống pattern hiện tại) |
| **Error (network)**     | Toast generic error                                          |
| **Success**             | `router.push('/')` — về trang chủ                            |

---

## 📐 Screen 2 — Sign Up

### Layout tổng thể

```
┌─────────────────────────────┐  ← scroll được nếu content tràn
│  padding: px-[30px] pt-12  │
│                             │
│  Sign Up               h1  │  ← text-[28px] font-bold
│  subtitle              p   │
│                             │
│  [G] Sign up with Google   │  ← OAuth 2 button (flex, split ngang)
│  [X] Sign up with X        │
│                             │
│       ────── Or ──────      │
│                             │
│  ┌──────────┐ ┌──────────┐ │
│  │First Name│ │Last Name │ │  ← 2 input chia đôi (gap-3)
│  └──────────┘ └──────────┘ │
│                             │
│  Email *                   │
│  ┌──────────────────────┐  │
│  │ Enter your email     │  │
│  └──────────────────────┘  │
│                             │
│  Password *                │
│  ┌────────────────────👁 ┐  │
│  │ Enter your password  │  │
│  └──────────────────────┘  │
│                             │
│  [✓] By creating... Terms  │  ← checkbox + inline text với links
│       ...and Privacy Policy │
│                             │
│  ┌──────────────────────┐  │
│  │       Sign Up        │  │  ← CTA button
│  └──────────────────────┘  │
│                             │
│  Already have account? Sign In│
└─────────────────────────────┘
```

### Chi tiết từng element

#### Heading block

- Giống Sign In — đổi text thành "Sign Up" và subtitle tương ứng

#### OAuth Buttons

- Giống Sign In — đổi text thành "Sign up with Google" / "Sign up with X"

#### First Name + Last Name (2 cột)

- Container: `flex gap-3`
- Mỗi field: `flex-1` với label + input
- Input: `size="sm"` (h-11) để vừa vặn hơn ở layout 2 cột
- Label: `text-[12px] font-medium text-neutral-800 mb-1`
- Required `*`: ở cả 2 field

#### Email field

- Giống Sign In — full width

#### Password field

- Giống Sign In — type="password" với toggle eye

#### Terms & Privacy checkbox

- Container: `flex items-start gap-2.5 mt-1 mb-5`
- `<Checkbox>` component Radix hiện có — `id="agreeTerms"`
- Label text: `text-[12px] text-neutral-600 leading-[1.5] font-dinpro`
- "Terms and Conditions": `text-neutral-black underline underline-offset-1 font-medium`
- "Privacy Policy": `text-neutral-black underline underline-offset-1 font-medium`
- Validation: checkbox phải được check trước khi submit, nếu không show error `text-[11px] text-red-500 mt-1`

#### CTA Button "Sign Up"

- Giống Sign In — text "Sign Up", loading text "Creating account..."

#### Footer "Already have account?"

- Giống Sign In footer nhưng ngược lại — link "Sign In" về `/[locale]/sign-in`

### Validation (Zod)

```typescript
export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, 'Password must contain uppercase, lowercase, and a number'),
  agreeTerms: z.boolean().refine((v) => v === true, 'You must agree to the terms'),
});
export type RegisterSchema = z.infer<typeof registerSchema>;
```

### States & UX

| State                   | Behavior                                          |
| ----------------------- | ------------------------------------------------- |
| **Submitting**          | Button disabled + spinner                         |
| **Error (email taken)** | `t('signUp.errorEmailTaken')` via `useAlertStore` |
| **Success**             | Tự động đăng nhập + `router.push('/')`            |

---

## 📐 Screen 3 — Forgot Password

### Layout tổng thể

```
┌─────────────────────────────┐
│  padding: px-[30px] pt-12  │
│                             │
│  Forgot Your           h1  │  ← text-[26px] font-bold (nhỏ hơn chút)
│  Password?                 │  ← 2 dòng tự nhiên
│                             │
│  subtitle — mô tả dài      │  ← text-[13px] text-neutral-500, multi-line
│                             │
│  Email *                   │
│  ┌──────────────────────┐  │
│  │  Enter your email    │  │
│  └──────────────────────┘  │
│                             │
│  ┌──────────────────────┐  │
│  │   Send Reset Link    │  │  ← CTA button
│  └──────────────────────┘  │
│                             │
│  Wait, I remember...       │  ← text link về trang Sign In
│  Click here                │
└─────────────────────────────┘
```

### Chi tiết từng element

#### Heading block

- **Heading `<h1>`**: `text-[26px] font-bold tracking-[-0.3px] text-neutral-900 font-dinpro leading-tight`  
  Text: "Forgot Your Password?" — để tự xuống dòng tự nhiên (không dùng `<br/>`)
- **Subtitle `<p>`**: `text-[13px] text-neutral-500 mt-2 mb-7 leading-[1.6] font-dinpro`  
  Text: dài hơn, mô tả rõ ràng, xuống nhiều dòng

#### Email field

- Label + Input giống Sign In — full width, `size="default"`

#### Success state

- Sau khi submit thành công: **thay thế toàn bộ form** bằng success message
- Container success: `flex flex-col items-center text-center py-8 gap-4`
- Icon: checkmark SVG `w-16 h-16` với circle xanh nhạt
- Heading: `text-[20px] font-semibold text-neutral-900 font-dinpro`
- Subtitle: `text-[13px] text-neutral-500`
- Không auto-redirect — để user tự đóng

#### CTA Button "Send Reset Link"

- Giống Sign In — text "Send Reset Link", loading: "Sending..."

#### Footer "Wait, I remember..."

- Container: `text-center mt-5`
- Text `"Wait, I remember my password..."`: `text-[13px] text-neutral-500 font-dinpro`
- "Click here": `text-neutral-black underline underline-offset-2 font-medium`
- Navigate về `/[locale]/sign-in`
- **Không phải 2 dòng tách biệt** — tất cả inline trên 1-2 dòng

### Validation (Zod)

```typescript
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
```

### States & UX

| State                 | Behavior                                                |
| --------------------- | ------------------------------------------------------- |
| **Idle**              | Form bình thường                                        |
| **Submitting**        | Button disabled + spinner                               |
| **Success**           | Ẩn form, show success message (không redirect)          |
| **Error (not found)** | `t('forgotPassword.errorNotFound')` via `useAlertStore` |

---

## 🔗 ROUTE constants cần bổ sung

Thêm vào `src/types/routes.ts`:

```typescript
SIGN_IN: '/sign-in',
SIGN_UP: '/sign-up',
FORGOT_PASSWORD: '/forgot-password',
```

---

## 🧩 Dependencies & Patterns

### React Hook Form + Zod

```typescript
const form = useForm<LoginSchema>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '', rememberMe: false },
});
```

### Alert pattern (dùng `useAlertStore` hiện có)

```typescript
import { useAlertStore } from '@/stores/use-alert-store';

// Khi có lỗi:
useAlertStore.getState().addAlert({ type: 'error', title: t('signIn.errorInvalid') });

// Khi thành công:
useAlertStore.getState().addAlert({ type: 'success', title: 'Signed in!' });
```

### getStaticProps pattern (giống các page hiện có)

```typescript
// src/pages/[locale]/sign-in.tsx
export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'authPage'])),
  },
});

export const getStaticPaths = async () => ({
  paths: [{ params: { locale: 'en' } }, { params: { locale: 'vi' } }],
  fallback: false,
});
```

---

## 📦 API layer spec

### `src/api/auth/types.ts`

```typescript
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

export interface IRegisterParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IRegisterResponse extends ILoginResponse {}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface IForgotPasswordParams {
  email: string;
}

export interface IForgotPasswordResponse {
  message: string;
}
```

### `src/api/auth/requests.ts`

```typescript
import { request } from '../axios';
import type {
  ILoginParams,
  ILoginResponse,
  IRegisterParams,
  IRegisterResponse,
  IForgotPasswordParams,
  IForgotPasswordResponse,
} from './types';

export const loginRequest = async (params: ILoginParams): Promise<ILoginResponse> => {
  const { data } = await request({ url: '/authentication/log-in', method: 'POST', data: params });
  return data;
};

export const registerRequest = async (params: IRegisterParams): Promise<IRegisterResponse> => {
  const { data } = await request({ url: '/authentication/register', method: 'POST', data: params });
  return data;
};

export const forgotPasswordRequest = async (params: IForgotPasswordParams): Promise<IForgotPasswordResponse> => {
  const { data } = await request({ url: '/authentication/forgot-password', method: 'POST', data: params });
  return data;
};

export const logoutRequest = async (): Promise<void> => {
  await request({ url: '/authentication/log-out', method: 'POST' });
};
```

### `src/api/auth/queries.ts`

```typescript
import { createMutation } from 'react-query-kit';
import { loginRequest, registerRequest, forgotPasswordRequest } from './requests';
import type {
  ILoginParams,
  ILoginResponse,
  IRegisterParams,
  IRegisterResponse,
  IForgotPasswordParams,
  IForgotPasswordResponse,
} from './types';

export const useLoginMutation = createMutation<ILoginResponse, ILoginParams>({
  mutationFn: loginRequest,
});

export const useRegisterMutation = createMutation<IRegisterResponse, IRegisterParams>({
  mutationFn: registerRequest,
});

export const useForgotPasswordMutation = createMutation<IForgotPasswordResponse, IForgotPasswordParams>({
  mutationFn: forgotPasswordRequest,
});
```

---

## 🎨 Social OAuth icon SVG spec

### Google Icon

```jsx
// Dùng SVG chính thức 4 màu của Google
<svg viewBox="0 0 24 24" width="18" height="18">
  <path
    fill="#4285F4"
    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
  />
  <path
    fill="#34A853"
    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
  />
  <path
    fill="#FBBC05"
    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
  />
  <path
    fill="#EA4335"
    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
  />
</svg>
```

### X (Twitter) Icon

```jsx
// X logo đơn giản
<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
</svg>
```

---

## ✅ Checklist trước khi code

- [ ] Tạo `authPage.json` cho cả `en` và `vi`
- [ ] Thêm `SIGN_IN`, `SIGN_UP`, `FORGOT_PASSWORD` vào `src/types/routes.ts`
- [ ] Tạo `src/lib/validations/auth.ts` với 3 schemas
- [ ] Tạo `src/api/auth/` (types, requests, queries)
- [ ] Tạo 3 page files trong `src/pages/[locale]/`
- [ ] Tạo 3 module components trong `src/modules/`
- [ ] Đảm bảo mỗi page dùng `MainLayout` (mobile shell `max-w-[430px]`)
- [ ] Test trên `/en/sign-in` và `/vi/sign-in` — font, màu, layout đúng
- [ ] Test validation errors hiển thị đúng
- [ ] Test loading states (button spinner)
- [ ] Không có hardcoded text tiếng Việt trong JSX
