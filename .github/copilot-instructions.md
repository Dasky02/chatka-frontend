# Copilot instructions for Chatka frontend

This file contains concise, actionable guidance for an AI coding assistant working on this repository.

## Big picture
- Frontend: React + Vite app in the repository root (`src/`). Dev server runs on `http://localhost:5173`.
- Backend: Spring Boot API started from `setup-fe` via Docker Compose (exposes port `8080` and Swagger at `/swagger-ui/index.html`).
- Vite proxies `/api` to the backend by default (see `vite.config.js`). If `VITE_API_URL` is set, requests use that instead (`src/api.js`).

## Key dev commands
- Install dependencies: `npm install` (run from repository root).
- Start frontend dev server: `npm run dev` (uses Vite on port 5173).
- Build production bundle: `npm run build`.
- Preview build: `npm run preview`.
- Lint: `npm run lint` (ESLint configuration present).
- Start local backend (in separate shell):
  - `cd setup-fe`
  - `docker compose up -d --build`

## Where to look (important files / folders)
- `vite.config.js` — Vite server config and proxy for `/api` → `http://localhost:8080`.
- `package.json` — scripts (`dev`, `build`, `lint`, `preview`).
- `setup-fe/docker-compose.yml` & `setup-fe/README.md` — local backend startup.
- `src/api.js` — centralized API helpers: `apiUrl`, `request`, `getJson`, `postJson`, and `admin` flag handling (adds `X-Admin-Token`). Prefer these helpers when adding new API calls.
- `src/api/*.js(x)` — concrete API modules (e.g. `booking.js`, `categories.js`, `auth.jsx`) show real usage patterns.
- `src/components/*` and `src/pages/*` — UI components and pages. Admin-specific components are under `src/components/admin` and `src/pages/Admin`.

## API / auth conventions (project-specific)
- Browser cookie for user session: some modules read a cookie named `token` with `getCookie` (see `src/api/functions.jsx` and `src/api/categories.js`).
- Admin authentication: `saveAdminToken` / `getAdminToken` in `src/api.js` store a token in `localStorage` and `request(..., { admin: true })` automatically sets `X-Admin-Token` header.
- URL resolution: use `apiUrl(path)` from `src/api.js` instead of concatenating strings. If `VITE_API_URL` is empty the app relies on Vite proxy; otherwise requests are absolute.
- Error handling: `request` throws enriched Error objects with `status` and `payload`. Catch or rethrow consistently.

## Patterns & examples
- Prefer `getJson('/api/admin/bookings', { admin: true })` to call protected admin endpoints. Example: `src/api.js` provides `postJson(path, body, { admin: true })`.
- Public endpoints often call `apiUrl('/api/public/...')` directly (see `src/api/booking.js`).
- Some modules still use `fetch('/api/...')` directly — when adding new code, prefer `src/api.js` helpers for consistent headers/error handling.

## Developer workflows and debugging tips
- If API calls fail locally, confirm backend is running: `http://localhost:8080/swagger-ui/index.html`.
- To reproduce production-like API URLs, set `VITE_API_URL` in `.env` (or in the environment) to the backend base URL — `src/api.API_BASE_URL` exposes it for debugging.
- Use browser devtools to inspect cookies and localStorage for `token` and `adminToken` values.

## Conventions & small pitfalls
- Multiple `getCookie` helpers exist (`src/api/functions.jsx`, `src/api/categories.js`) — prefer the one in `src/api/functions.jsx` when possible.
- Some API files use `apiUrl(...)` while others use plain `/api/...`. When changing code, keep consistent with nearby code but prefer `apiUrl` for new helpers.
- Admin endpoints expect `X-Admin-Token` header; UI code stores it in `localStorage` via `saveAdminToken`.

## When editing tests / CI
- There are no formal tests in the repo. Do not add CI assumptions unless asked.

## If you need clarification
- Ask for the target environment (local Docker backend vs remote API URL) and whether admin or guest flows are the change target.
- Point to specific files if behavior is unexpected (e.g. `src/api.js`, `vite.config.js`, `setup-fe/docker-compose.yml`).

---
If anything here is unclear or you want additional examples (component-level patterns, common prop names, or data shapes used in `src/pages/BookingStatusPage.jsx`), tell me which area to expand and I'll update this file.
