# 02 · Tech stack (versions from `package.json`)

| Concern | Tech | Version | Notes / gotchas |
| --- | --- | --- | --- |
| Framework | Next.js **Pages Router** | ^13.5 | No App Router. `_app.tsx` layout via `getLayout`. `reactStrictMode` off. |
| UI lib | React | ^18.2 | |
| Language | TypeScript | 5.1.6 | `strict`, alias `@/* → src/*` |
| Server state | @tanstack/react-query | **v4** (installed 4.43) | Use `isLoading`, **never `isPending`** (v5-only → always `undefined`). |
| Query helpers | react-query-kit | ^2 | `createQuery/createMutation/createInfiniteQuery`, keys via `primaryKey` + `variables`; `useX.getKey()` |
| Client state | zustand (+ `auto-zustand-selectors-hook`) | ^4.4 | Read as `useStore.use.field()`. Persisted stores: `user-store`, `admin-store`. |
| HTTP | axios | ^1.5 | Single instance `src/api/axios.ts` (tokens, refresh). Rejects with **BE body**, not AxiosError. |
| Forms | react-hook-form + @hookform/resolvers + zod | 7.47 / 3 / 3.22 | Schemas in `src/lib/validations/*` |
| i18n | next-i18next (i18next 23) | ^15.3 | Locales `en` (default), `vi`; namespaces in `public/locales/{en,vi}/*.json` |
| Styling | Tailwind CSS | ^3.4 | **Custom overrides** (see 08): `md/lg/xl` = 10000px, spacing `4`=4px… |
| Components | shadcn/ui on Radix, lucide-react, cva, tailwind-merge | | Shared admin UI in `src/components/ui/admin-*` |
| Animation | framer-motion, animate.css | 10.x | |
| Video | hls.js + native `<video>` | ^1.6 | `BunnyVideoPlayer`, shared pool of 5 `<video>` (iOS) |
| Upload | tus-js-client | ^4.3 | Signature from BE `POST /upload/video`, upload to Bunny |
| Rich text | **TinyMCE** (`@tinymce/tinymce-react`) | 8 | `src/styles/tiptap.css` is legacy (no TipTap dep). `postinstall` copies TinyMCE assets. |
| Maps | @goongmaps/goong-js + REST | | Keys `NEXT_PUBLIC_GOONG_*` |
| Payments | @paypal/react-paypal-js | 10 | VNPay is redirect (no SDK) |
| Onboarding | driver.js | 1.6 | Guide profile tutorial |
| Dates | dayjs + date-fns | | Both in use |
| Monitoring | @sentry/nextjs | 10 | prod only; `src/lib/logger.ts` |
| Fonts | `next/font/local` Outfit (self-hosted woff2) + DINPro (`fonts.css`) | | Do not switch back to `next/font/google` (download timeouts → Arial fallback). |
| Tooling | pnpm 9.1, ESLint 8 (airbnb-ts, simple-import-sort, unused-imports), Prettier 2.8 (printWidth 120), Husky + commitlint (conventional) | | `.nvmrc` says Node 16 but Sentry 10 needs newer Node — use current LTS. |
| Load tests | k6 (`tests/k6`) | | `pnpm test:k6*`. No unit/e2e tests. |
