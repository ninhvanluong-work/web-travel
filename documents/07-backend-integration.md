# 07 · Backend, database & MCP tools

## Backend

| Item | Value |
| --- | --- |
| Repo | `web-travel-be` (NestJS + TypeORM). Local clone `D:\Remote\web-travel-be\web-travel-be` (often stale → `git fetch` then read `origin/main` with `git show origin/main:<path>`, never edit) |
| URL | `https://web-travel-be.fly.dev` (`NEXT_PUBLIC_API_URL`) |
| Docs | Swagger UI `/docs`, JSON `/docs-json` (fetch it to check params/DTO/security instead of guessing) |
| Envelope | success `{data, code, message, error:null}`; error `{statusCode, message (string \| string[]), timestamp, path}` |
| Auth decorators | `@Public`, `@Admin` (admin+super_admin), `@SuperAdmin`, `@TourGuide` (token has `tourGuideId`); combined = OR. Guard wraps failures as `401 "Token expired or invalid"` even for role mismatch |
| Tokens | login returns `{token, refreshToken, user}` (FE maps `token`→`accessToken`); refresh `POST /auth/access-token/renew`; a new login revokes the previous refresh token |
| Pagination | `page`, `pageSize` (max 50) |

## Endpoint index (by domain)

| Domain | Endpoints used by FE |
| --- | --- |
| auth | `POST /auth/{login,admin/login,register,logout,forgot-password,reset-password,change-password,access-token/renew}` |
| video | `GET /video` (feed/search, cursor `distanceScore`), `GET /video/:slug`, `GET /video/admin`, `POST /video/:id/{like,dislike}`, `POST/PUT /video` |
| product | `GET/POST /product`, `GET/PUT /product/:id`, `POST /product/:id/status/:status`, `GET /product/:id/{review,booking}` — **no DELETE** |
| session | `GET/POST /session`, `POST /session/range`, `GET/PUT/DELETE /session/:id` |
| option / departure-time / pickup-location | CRUD (also nested in product PUT) |
| booking | `GET/POST /booking`, `POST /booking/:id/cancel {reason}`, `GET /booking/:id/payment`, `GET /booking-payment/:id/logs` |
| payment | `GET /payment/paypal/config`, `POST /payment/paypal/:bookingId/{create-order,capture-order}`, `POST /payment/vnpay/:bookingId/create-payment-url` |
| destination, supplier, supplier-payment, tag, element | list/detail/CRUD |
| tour-guide | `GET /tour-guide[/skills]`, `GET/PUT/DELETE /tour-guide/:id`, `POST /tour-guide/onboarding`, `GET/POST /tour-guide/:id/moment`, `PUT/DELETE /tour-guide/:id/moment/:momentId`, `GET /tour-guide/:id/review`, `POST /review/tour-guide/:id` |
| user | `GET /user` (admin list, `role`, `keyword`), `GET/PUT/DELETE /user/:id`, `POST /user`, `POST /user/:id/reset-password` |
| upload | `POST /upload/img` (multipart), `POST /upload/video` (Bunny tus signature) |

Full FE hook ↔ endpoint table: `src/api/<domain>/queries.ts` + `requests.ts`.

## Known BE facts that shape FE code

- Email compared **case-sensitively** → FE lowercases (`normalizeEmail`) everywhere.
- Search uses ILIKE; BE commit `adb0f84` (2026-10-25) added wildcard escaping — verify before relying on it. Keywords are trimmed by FE.
- `PUT /product` is partial: omitted fields keep old values (so FE must send `[]` to clear).
- Booking total computed server-side from session unit prices.
- `/upload/*` is `@Public` (throttled) — open BE item.
- Open BE items list: `docs/be-reports/*.md`, `docs/review-codebase-2026-11-11.md` §6.

## MCP servers (configured in `.mcp.json`, secrets inside — never print)

| Server | Use | Safety |
| --- | --- | --- |
| `_postgres` → `mcp___postgres__query` | live DB, **read-only** SQL | never `SELECT "user".password`, reset tokens, card numbers, payment raw responses |
| `_web-travel-api` | Swagger-generated **GET-only** tools (logs in as admin automatically) | logging in revokes the admin session in the browser |
| `playwright` | browser testing on `localhost:3000` | do not click destructive actions on real data |
| `_context7` | library docs | — |

Skill **`web-travel-db`** (`.claude/skills/web-travel-db/`): schema of all tables/relations (`references/schema.md`), query cookbook, introspect SQL. Load it before writing SQL.

## Data cautions (prod DB is shared)

- Test data is real data: prefix test records with `ZZ`, report what you created, ask before deleting.
- Writes go through the API (or reviewed SQL), never via MCP.
