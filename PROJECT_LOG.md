# Project Log

## 2026-05-09
- Updated Day 2 plan with bug-fix instructions, revised priority order, and cut list guidance.
- Corrected plan snippets for summary route order, events query, AI axios usage, TASK_CREATE regex, App.jsx handleMove, and Dashboard summary null safety.
- Revised Day 2 plan for normalize.js usage, simplified auth (no refresh tokens), stricter AI schedule schema/JSON parsing, calendar dedupe, and updated frontend auth/task snippets.
- Realigned Day 2 plan to the official requirements: refresh-token auth, task status enum (todo/in-progress/done), updated schema, auth flows, failure modes, and bonus list ordering.
- Moved the Vite app into frontend/ and scaffolded axon-backend with scripts, schema, db.js, index.js, and env placeholders.

## 2026-05-08
- Created the initial Axon project skeleton.
- Added Vite, React, Tailwind, and React Router configuration.
- Added `src` folders and stub files for API, components, pages, and data.
- Added placeholder app entry points and neutral default mock data.
- Renamed remaining branding in the plan to Axon.
- Tuned Vite config to reduce dependency discovery and watcher scope after dev OOM.
- Fixed ReactDOM import in src/main.jsx to resolve default export error.
- Added optimizeDeps includes for core React packages to avoid require-in-browser errors.
- Added local .tools ignore entry for a portable Node workaround.
- Added dashboard background image styling with a scrim overlay and gradient fallback.