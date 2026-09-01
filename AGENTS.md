# Questlog — Base44 dev notes

## What this is
A full-stack game tracker. Backend: Node + Express + MongoDB (JWT auth, game library CRUD, activity feed). Web frontend: vanilla HTML/CSS/JS SPA served as static files. Mobile: React Native + Expo app (in `mobile/`, not run in the preview).

## Architecture
- `server/` — Express backend (ESM). Entry `server.js`. Models in `server/models/`, routes in `server/routes/`, middleware in `server/middleware/`. Serves the web frontend from `public/` and uploaded posters from `server/uploads/`.
- `public/` — web frontend SPA (`index.html`, `styles.css`, `js/` modules: `api.js`, `app.js`, `auth.js`, `library.js`, `feed.js`).
- `mobile/` — Expo app (React Navigation). Connects to the same backend; set `API_BASE` in `mobile/src/api/client.js` to the backend URL when running on a device.
- Legacy files at repo root (`app.js`, `extras.*`, `production.*`, etc.) are the original static demo and are no longer served.

## Running it
`docker compose -f docker-compose.base44.yml up -d` — starts `mongo` (mongo:7) and `web` (node:22). The web service runs `npm install && npm run dev` (`node --watch server.js`) in `/app/server`, bind-mounted at `/app` so edits hot-reload. Port 3000.

## API
- `POST /api/auth/signup`, `POST /api/auth/login` → `{ token, user }` (JWT, 7-day expiry)
- `GET /api/auth/me`, `PUT /api/auth/onboarding` (bearer-protected)
- `GET/POST/PUT/DELETE /api/games` (bearer-protected; POST/PUT accept multipart `poster` file upload or `posterUrl`; games now carry `description`, `genre`, `totalMinutes`)
- `GET /api/games/:id` — single game with its sessions array
- `POST /api/games/:id/sessions` — log a play session (minutes, date); increments game playtime + emits a `played_session` activity
- `GET/POST /api/activities` (bearer-protected)
- `GET /api/stats` — aggregated analytics (hours, completed, platforms, genres, status breakdown, 14-day daily series, current/longest streaks)
- `GET /api/friends/search?q=`, `GET /api/friends`, `POST/DELETE /api/friends/:id` — follow/unfollow users
- `GET /api/friends/:id/library`, `GET /api/friends/:id/activity`, `GET /api/friends/:id/compare` — view a friend's library, activity, and shared-game progress comparison
- Adding/editing/deleting games and logging sessions auto-generate activity entries (added_game, started_game, finished_game, updated_progress, removed_game, played_session).

## Pages (web)
My library (grid; clicking a card opens Game Details), Activity feed, Stats & Analytics (CSS bar charts, streaks), Friends (search/add/unfollow, view friend library/activity, compare progress), Profile, plus Game Details (poster, description, progress slider, notes, playtime, add session). All share the sidebar nav and dark theme.

## Secrets
None required to boot. `JWT_SECRET` and `SESSION_SECRET` have dev placeholders in compose. No external service credentials needed.

## Premium & Admin
- User model has `premiumTier` ("free"|"pro"), `role` ("user"|"admin"), and `theme` fields.
- Premium is unlocked via codes (`POST /api/user/premium/unlock`), a developer toggle (`POST /api/user/premium/toggle`), or a secret unlock link (`/?unlock=CODE`). Valid codes: QUESTLOG-PRO, PREMIUM-2024, GAMER-FOREVER, UNLOCK-PRO.
- `requirePremium` middleware gates the heatmap endpoint; free tier is limited to 5 friends (enforced server-side); custom cover file uploads require premium.
- Admin account is auto-seeded on startup: `admin@questlog.dev` / `admin123456` (username `preet`, role `admin`, premiumTier `pro`).
- Admin routes (`/api/admin/*`) use `requireAdmin` middleware: list users, toggle premium, reset user data, delete users, app analytics.
- Themes: 4 free (default, daylight, slate, ocean) + 5 premium (neon, cyberpunk, midnight, sunset, pixel). Applied via CSS custom properties on `<html>`. Saved per-user via `PUT /api/user/theme`.
- Web frontend: Settings page (Premium + themes + dev toggle), Admin panel (admin-only nav), lock icons on premium-only stats (genre, heatmap, streaks), Premium/Admin badges on profile.
- Mobile: SettingsScreen (premium toggle + themes), AdminScreen (admin panel), StatsScreen (with premium locks), ProfileScreen (badges).

## Verify
- `curl -sf http://localhost:3000/api/health` → `{"ok":true}`
- Full API flow tested via curl: signup → me → onboarding → add game → list games → activities → login (all pass).
- Frontend verified in preview: signup → onboarding → app shell → add game → game card in library → activity entry in feed.
