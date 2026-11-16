# web-travel · AI documentation (start here)

Compact, verified context for AI agents and new devs. **Read this file, then only the file(s) your task needs.** Each file is self-contained (~1–2k tokens). Snapshot: 2026-11-16 (`dev`). Code wins over docs — if they disagree, trust the code and update the doc.

| File | Read when |
| --- | --- |
| [01-overview.md](./01-overview.md) | First contact: what the product is, domain chain, systems |
| [02-tech-stack.md](./02-tech-stack.md) | Choosing APIs/libs; version-specific behavior (RQ v4, Pages Router) |
| [03-architecture.md](./03-architecture.md) | Data flow, axios/tokens, React Query rules, stores, video & upload architecture |
| [04-source-map.md](./04-source-map.md) | Finding where something lives; shared hooks & UI to reuse |
| [05-client-screens.md](./05-client-screens.md) | Any client page (home, search, video feed, product, booking, guide, auth) + must-not-break rules |
| [06-admin-screens.md](./06-admin-screens.md) | Any `/admin` page, permissions, product form & sessions, booking cancel |
| [07-backend-integration.md](./07-backend-integration.md) | Endpoints, error/auth contract, MCP tools, DB access |
| [08-conventions-gotchas.md](./08-conventions-gotchas.md) | **Before editing any code** — rules, Tailwind traps, error handling |
| [09-dev-workflow.md](./09-dev-workflow.md) | Commands, definition of done, git, where to write specs/BE reports |
| [10-mcp-browser-testing.md](./10-mcp-browser-testing.md) | (VI) Setup & safety for browser MCP: screenshots, UI tests |
| [11-client-guide.md](./11-client-guide.md) | (VI) Client user guide: screen flow (A → button → B), how to use each screen, test prompts |
| [12-admin-guide.md](./12-admin-guide.md) | (VI) Admin user guide: screen flow, CRUD pattern, each module, test prompts |
| `test-accounts.local.md` | Test logins per role — **local only, gitignored**; never copy into other docs |
| [slides/onboarding.html](./slides/onboarding.html) | Human onboarding deck (Vietnamese, open in a browser, ←/→ keys) |
| [guides/huong-dan-khach-hang.html](./guides/huong-dan-khach-hang.html) | (VI, non-technical) Illustrated end-user guide with screenshots — client app |
| [guides/huong-dan-quan-tri.html](./guides/huong-dan-quan-tri.html) | (VI, non-technical) Illustrated admin guide with screenshots (PII blurred) |
| [qa/2026-11-16/report.html](./qa/2026-11-16/report.html) | (VI) QA run by agent `qa-tester`: report, test plan/data/cases, evidence |

## Task → read map

| Task | Read |
| --- | --- |
| Fix a UI bug on a client page | 08 → 05 (screen section) |
| Touch video feed / search grid | 05 §Video detail / §Search (MNB rules) → 03 §Video |
| New admin CRUD screen | 06 (copy Destination/User patterns) → 04 §Shared UI → 08 |
| Change an API call / add endpoint | 07 → 03 §API layer & §Auth → `src/api/<domain>` |
| Booking / payment | 05 §Booking → 07 (booking, payment) |
| DB / data question | 07 §MCP → skill `.claude/skills/web-travel-db` |
| Styling / layout | 08 §Tailwind traps → 02 |
| i18n text | 08 rule 3 → `public/locales/{en,vi}/<ns>.json` |
| Write a spec or BE report | 09 §Docs conventions |
| Screenshot / UI test a client page | 10 → 11 (flow + prompts) → `test-accounts.local.md` |
| Screenshot / UI test an admin page | 10 → 12 (flow + prompts) → `test-accounts.local.md` |
| Run a QA test set | agent `qa-tester` → outputs to `qa/<date>/` |

## 10 facts that prevent most mistakes

1. Pages Router; `src/pages/*` are thin, logic in `src/modules/*`.
2. Client UI lives in a 430×932 phone frame; admin is desktop.
3. Tailwind `md/lg/xl` never apply; spacing `4/8/12/16…` are overridden (`p-4` = 4px).
4. React Query **v4**: `isLoading`, not `isPending`; global `refetchOnMount:false`.
5. Axios rejects with the BE body → `getApiErrorMessage(err, fallback)`; show BE message verbatim.
6. Admin vs client tokens are separate stores, picked by route; `ensureAdminAuth()` for admin writes.
7. Video feed behaviors (reload gate, pool of 5, IO thresholds, shallow URL) are intentional.
8. All user text via i18n (en + vi).
9. Don't modify existing logic without user approval; reuse `src/components/ui/admin-*`.
10. Prod DB/API are live and shared: read-only MCP, `ZZ`-prefixed test data, never commit unless asked.
