# 08 · Conventions & gotchas (read before editing code)

## Hard rules (from CLAUDE.md + team feedback)

1. **Do not change existing logic without approval.** List the exact changes and wait (video behavior, scroll, IO, Zustand, React Query, API layer). New features: add, don't refactor around.
2. **Reuse shared UI** in `src/components` before creating anything (see 04 §Shared UI).
3. **i18n for every user-facing string** (`useTranslation(ns)`), en + vi keys. Exception: BE error messages are shown verbatim.
4. **Show the BE error message** via `getApiErrorMessage(err, t('fallback'))`. Never read `err.response.data` (interceptor rejects with the body).
5. **English code comments only.**
6. Hooks in `src/hooks/` (or the module's `hooks/` for screen-only hooks); routes in `src/types/routes.ts`.
7. Global CSS → `tailwind.config.ts` tokens or `src/styles/globals.css` layers.
8. Inline UI messages → `src/components/ui/AlertBanner`; toasts → `useAlertStore`.
9. **Never commit/push unless asked.** "ok" to implement ≠ commit.
10. After finishing: run lint/types; remind the user to run `lint-changed.bat`.

## Tailwind traps (project overrides in `tailwind.config.ts`)

| Trap | Reality | Do instead |
| --- | --- | --- |
| `md:`, `lg:`, `xl:`, `2xl:` | breakpoints = **10000px** → never apply | unprefixed classes, or `xs:` (375) / `sm:` (414) |
| spacing keys `4 8 12 16 24 32 40 48 56 64 72 80 88 96` | mean **px/16 rem of the number** (`p-4`=4px, `w-8`=8px, `w-80`=80px, `12`=8px!) | arbitrary values `p-[16px]`, `w-[320px]`, or non-overridden keys (`2`, `3`, `5`, `6`, `10`…) |
| `border` | default width 1.5px | — |
| fonts | `font-sans` = Outfit (local), `font-dinpro` | keep `next/font/local` |

## React Query v4

- `isLoading` for mutations (no `isPending`). Lists: `keepPreviousData`, `isFetching && !isLoading` for spinners.
- Global `refetchOnMount:false` → refresh lists after mutations with `invalidateQueries({queryKey, refetchType:'all'})` or `refetchOnMount: true`.
- Query key prefix matching is per array element: `['/product']` ≠ `['/product/detail']`.

## Forms

- RHF + zod; messages are i18n keys (`'ns:key'` or key); helpers `requiredText` / `optionalText` (`lib/validations/text-fields.ts`), normalization `normalizeText`, `normalizeSingleLine`, `normalizeEmail`, `normalizeSearchKeyword`.
- Passwords never trimmed. Admin password rule 6–128; client sign-up/reset add upper/lower/number regex.
- Admin forms: stay on form after save, `BackToListButton`, leave-confirm when dirty, disable buttons with `isLoading`.

## Auth/session traps

- Admin and client sessions are separate stores; token chosen by route (`/admin*`).
- Logging in via curl/Swagger/MCP with the same admin account logs the browser out.
- `ensureAdminAuth()` only in admin-only paths (shared request fns get it in the admin hook).

## Dev environment traps

- `pnpm dev` runs `rimraf .next` → never start a second dev server while the user's is running; use `npx next dev -p 3001` if needed and stop it after.
- New keys in an **existing** locale JSON need a dev-server restart; new namespace files also need to be added to the page's `serverSideTranslations`.
- `.claude` hook `scout-block` rejects Bash commands containing `node_modules`, `.git/`, `dist/`, `build/` (even in grep) — use Glob/Grep tools.
- Hook `modularization-hook` warns on files >200 lines (advisory only).
- Bunny CDN / Google can be slow from the dev network; `next/image` hosts are whitelisted in `next.config.js` (`remotePatterns`).

## Known debt (don't "fix" silently; see `docs/review-codebase-2026-11-11.md`)

Stored XSS risk (`dangerouslySetInnerHTML` unsanitized), product payload drops empty arrays, custom pickup not sent, Supplier list client-side (49 max), page-only KPIs, dead files (`button-page`, product `tabs/*`, `SupplierGrid`, `SupplierDrawerForm`, `mock-guide.ts`), raw `fetch` for `/upload/video`.
