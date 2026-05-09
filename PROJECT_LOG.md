# Project Log

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