# 09 · Dev workflow

## Setup & commands

| Command | Does |
| --- | --- |
| `pnpm install` | also copies TinyMCE assets (`postinstall`) |
| `pnpm dev` | `rimraf .next out && next dev` (port 3000) |
| `pnpm build` / `pnpm start` | prod build / serve on 8080 |
| `pnpm lint` / `pnpm lint:fix` | ESLint (airbnb-ts, simple-import-sort, unused-imports) |
| `pnpm check-types` | `tsc --noEmit` |
| `pnpm format:write` | Prettier (printWidth 120, single quotes) |
| `lint-changed.bat` | ESLint/Prettier fix on changed files (ask the user to run after a task) |
| `pnpm test:k6*` | k6 load tests (`tests/k6`); there are **no unit/e2e tests** |

Env (`.env.example`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BUNNY_TUS_ENDPOINT`, `NEXT_PUBLIC_GOONG_API_KEY`, `NEXT_PUBLIC_GOONG_MAPTILES_KEY` (+ `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` prod).

## Definition of done (no tests → verify like this)

1. `npx eslint <changed files>` + `npx prettier --check <files>` + `pnpm check-types`.
2. Run the affected screen in the browser (Playwright MCP on `localhost:3000`), incl. empty / loading / error states and the phone frame.
3. For API work: read Swagger `/docs-json`, probe safely (invalid body / fake UUID → 400/404 shows auth passed without writing data), check DB via `_postgres` read-only.
4. Report what was verified vs not.

## Git

- Branch `dev` (main = `main`). Conventional commits; commitlint limits body lines to **100 chars**.
- Pre-commit: `pretty-quick --staged` → `pnpm lint` → `pnpm check-types` (~1–2 min).
- Commit only when asked; split by concern; never commit `ca-certificate.crt`, `.env*`, `.playwright-mcp/`.
- `git rm` stages immediately → it lands in the next commit (stage deliberately).

## Docs conventions

- Feature specs: `docs/specs/<domain>/<feature>.md` from `docs/specs/_template.md` (sections: problem, behavior table, technical changes, dependencies & conflicts, out of scope, open questions) + row in `docs/specs/README.md`.
- BE requests/bugs: `docs/be-reports/<topic>-<date>.md` (repro curl with placeholders, root cause file:line, proposed fix, acceptance table). No tokens/passwords in docs.
- This folder (`documents/`) = AI context; update the relevant file when architecture/conventions change.

## Useful agents & skills (`.claude/`)

| Need | Use |
| --- | --- |
| Code review | agent `code-reviewer` (skill `code-review`) |
| Find files fast | agent `Explore` / `scout` |
| DB questions / SQL | skill `web-travel-db` + `_postgres` MCP |
| UI work | skills `frontend-design`, `ui-styling`, `web-design-guidelines` |
| Planning | agent `planner`, skill `planning` |
