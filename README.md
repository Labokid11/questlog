# Questlog

Questlog is a social game tracker: log your library, follow friends, track what you are playing, and discover your next game.

## Included

- First-run onboarding with local profile storage
- Empty, ready-for-real-data library, activity, and friends views
- Theme picker, including Questlog Plus visual themes
- Admin and Plus profile treatments
- Account connection UI for Steam, Xbox, and PlayStation
- Node/Express authentication scaffold for platform OAuth callbacks

## Run locally

### Static UI

Open `index.html` in a browser for the interface demo.

### Account-connection backend

1. Install Node.js 20 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and provide a long `SESSION_SECRET`.
4. Run `npm run dev`.
5. Visit `http://localhost:3000`.

Read [BACKEND_SETUP.md](BACKEND_SETUP.md) before registering provider credentials. Never commit `.env` or platform secrets.

## Project structure

- `index.html` — application shell
- `*.css` / `*.js` — UI, themes, onboarding, and interaction modules
- `server.js` — Express server and OAuth callback routes
- `.env.example` — safe configuration template

## Current limitations

Account screens and imports are ready for integration, but game libraries will only sync after valid platform credentials and permitted API access are configured. Questlog Plus is a UI entitlement; billing is not yet connected.

## License

No license has been selected yet. Add one before accepting outside contributions or distributing the project.
