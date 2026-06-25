# Phase 01 — SignUpPage Overhaul

**Parent:** [plan.md](./plan.md)  
**Date:** 2026-06-24  
**Priority:** P0  
**Status:** pending

---

## Overview

SignUpPage currently has firstName/lastName/agreeTerms fields, no isTourGuide checkbox, and redirects to HOME on success. Per spec, it needs email+password+isTourGuide only, success → toast + redirect to /sign-in.

---

## Key Insights

- `IRegisterParams` in `src/api/auth/types.ts` has `firstName, lastName, company, email, password` — doesn't match new spec
- `signUpSchema` in `src/lib/validations/auth.ts` uses firstName, lastName, agreeTerms — needs rewrite
- `OAuthSection` is rendered in SignUpPage — must be hidden (per decision 4.3)
- Success currently calls `setStore(data)` and `router.push(ROUTE.HOME)` — spec says show toast → redirect to /sign-in
- `registerRequest` in requests.ts maps all fields including company — currently safe to change schema only, request fn passes params as-is

---

## Related Code Files

- `src/modules/SignUpPage/index.tsx` — main change target
- `src/lib/validations/auth.ts` — update `signUpSchema` + `SignUpSchema` type
- `src/api/auth/types.ts` — update `IRegisterParams`
- `public/locales/en/authPage.json` + `public/locales/vi/authPage.json` — add new keys

---

## Implementation Steps

### Step 1 — Update `IRegisterParams` in `src/api/auth/types.ts`

```typescript
export interface IRegisterParams {
  email: string;
  password: string;
  isTourGuide?: boolean;
}
```

Remove: firstName, lastName, company (these are unused by new backend spec)

### Step 2 — Update `signUpSchema` in `src/lib/validations/auth.ts`

```typescript
export const signUpSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  isTourGuide: z.boolean().default(false),
});
export type SignUpSchema = z.infer<typeof signUpSchema>;
```

Remove: firstName, lastName, agreeTerms

### Step 3 — Add i18n keys (en + vi)

In `signUp` section of both locale files:

```json
"isTourGuideLabel": "I am a Tour Guide",
"isTourGuideDescription": "Register as a tour guide to manage your profile and tours",
"successTitle": "Registration successful",
"successMessage": "Your account has been created. Please sign in."
```

Vietnamese:

```json
"isTourGuideLabel": "Tôi là Tour Guide",
"isTourGuideDescription": "Đăng ký làm hướng dẫn viên để quản lý hồ sơ và tour của bạn",
"successTitle": "Đăng ký thành công",
"successMessage": "Tài khoản đã được tạo. Vui lòng đăng nhập."
```

### Step 4 — Rewrite `src/modules/SignUpPage/index.tsx`

Changes:

1. Form fields: remove firstName, lastName → keep email + password only
2. Add isTourGuide checkbox (styled card like existing agreeTerms card)
3. Remove `<OAuthSection />` and its import
4. `onSubmit`: payload = `{ email, password, isTourGuide }`, remove firstName/lastName/company
5. `onSuccess`: do NOT call `setStore(data)` (register doesn't return token per spec) → addAlert success with duration:4000 → router.push(ROUTE.SIGN_IN)
6. `onError`: addAlert error with `duration: 2000`

---

## Todo

- [ ] Update IRegisterParams (remove firstName/lastName/company, add isTourGuide?)
- [ ] Update signUpSchema (remove firstName/lastName/agreeTerms, add isTourGuide, password min:6)
- [ ] Add i18n keys (en + vi)
- [ ] Rewrite SignUpPage form UI
- [ ] Fix onSuccess flow (toast + redirect to /sign-in)
- [ ] Fix onError (add duration: 2000)
- [ ] Remove OAuthSection from SignUpPage

---

## Success Criteria

- Form shows only email + password + isTourGuide checkbox
- Submit calls POST /auth/register with `{ email, password, isTourGuide }`
- Success: toast → redirect to /sign-in
- Error: toast auto-closes after 2s
- No Google button visible

---

## Risk Assessment

- Changing IRegisterParams may affect other callers → grep shows `registerRequest` only called from useRegisterMutation, which is only called in SignUpPage ✓
- Removing firstName/lastName from signUpSchema doesn't affect loginSchema or other schemas ✓

---

## Security Considerations

- Password min 6 chars (backend-dictated)
- No token stored on register (register returns null data per spec)
