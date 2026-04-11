---
name: Run lint-changed after finishing tasks
description: After completing any coding task, remind user to run lint-changed.bat to auto-fix ESLint and Prettier on changed files
type: feedback
---

Always remind the user to run `lint-changed.bat` (or `lint-changed.ps1`) after finishing implementation work.

**Why:** The project has a script that runs Prettier + ESLint --fix only on changed/new .ts/.tsx files. Running it cleans up import ordering, formatting, and lint errors in one shot without touching unrelated files.

**How to apply:** At the end of any coding session where .ts/.tsx files were modified, remind the user: "Chạy `lint-changed.bat` để auto-fix ESLint/Prettier trên các file đã thay đổi."
