# Questlog — Base44 dev notes

## What this is
A Node/Express app serving a static HTML/CSS/JS frontend (the Questlog game tracker UI) plus optional OAuth callback routes for Steam, Xbox, and PlayStation. No database, no build step — Express serves the repo's static files directly from disk.

## Running it
`docker compose -f docker-compose.base44.yml up -d` — uses `node:22`, runs `npm install` then `npm run dev` (`node --watch server.js`) on port 3000. The repo is bind-mounted at `/app`, so edits to static files appear immediately (Express reads from disk per request) and edits to `server.js` trigger a `node --watch` restart.

## Secrets
None required to boot. `SESSION_SECRET` has a dev fallback (a placeholder is set in compose). Platform OAuth credentials (`XBOX_CLIENT_ID`/`XBOX_CLIENT_SECRET`, `PLAYSTATION_*`, Steam Web API key) are optional — the app boots and serves the full UI without them; the `/auth/*` routes return "not configured" until credentials are added. If you want real account-connection flows to work, those credentials must be supplied via `/run/base44/app.env` (declare them with `set_secrets`).

## Verify
- `curl -sf http://localhost:3000/` returns the Questlog HTML shell.
- `curl -sf http://localhost:3000/api/connected-accounts` returns `{"steam":false,"xbox":false,"playstation":false}`.
