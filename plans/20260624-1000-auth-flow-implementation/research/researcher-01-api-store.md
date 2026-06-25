# Research Report 01 — Auth API Layer + UserStore + Axios

## UserStore (`src/stores/UserStore.ts`)

**Current fields:**

- `user: IUser | null` — `{ id, name, email, role? }`
- `accessToken: string | null`
- `refreshToken?: string | null`

**Persist config:**

- Middleware: `zustand/middleware` persist
- Key: `'user-store'`
- Storage: localStorage

**Selector pattern:**

- Uses `createSelectorFunctions` from `auto-zustand-selectors-hook`
- Access: `useUserStore.use.accessToken()` not `useUserStore(s => s.accessToken)`

**Methods:**

- `setStore(partial)` — bulk update
- `setAccessToken(token)` — update token only
- `logout()` — clears all auth state

---

## Auth API (`src/api/auth/`)

Full domain folder already exists:

### `types.ts`

- `IUser { id, name, email, role? }`
- `LoginPayload { email, password }`
- `RegisterPayload { email, password, isTourGuide?: boolean }`
- `LoginResponse { token, refreshToken, user: IUser }`
- `RegisterResponse { data: null, code, message, error }`

### `requests.ts`

- `loginRequest(payload)` → POST `/auth/login`, maps `response.data.token` → `accessToken`
- `registerRequest(payload)` → POST `/auth/register`
- `refreshTokenRequest(refreshToken)` → POST `/auth/refresh` using raw axios (bypasses interceptors)
- Note: mock guide fallback exists in `loginRequest()` for local testing

### `queries.ts`

- Uses `react-query-kit` mutations
- `useLoginMutation` and `useRegisterMutation` likely exist or need creating

---

## Axios (`src/api/axios.ts`)

**Token attachment:**

- Request interceptor: `Authorization: Bearer {accessToken}` from UserStore

**401 Refresh flow:**

1. Catch 401 response
2. Call `refreshTokenRequest(refreshToken)`
3. On success: call `setAccessToken(newToken)`, retry original request
4. On failure: call `logout()`, redirect to HOME (`/`)

**Key finding:**

- `refreshTokenRequest` currently updates `accessToken` only via `setAccessToken()`
- If backend returns rotated `refreshToken` too → need to call `setStore()` instead

---

## Unresolved Questions

1. Does `IUser` already have `role` field? Need to confirm for guide redirect logic.
2. Does `queries.ts` already export `useLoginMutation` / `useRegisterMutation`?
3. Does refresh endpoint return rotated refreshToken?
