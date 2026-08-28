# Questlog secure account backend

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`, then set a strong `SESSION_SECRET`.
4. Run `npm run dev` and open `http://localhost:3000`.

## Before production

- Use HTTPS and a persistent session store such as Redis; the included in-memory session store is local-development only.
- Keep `.env` outside Git and use a secrets manager in deployment.
- Register the exact callback routes shown in `.env.example` with each platform.
- Store refresh tokens encrypted at rest and implement token rotation/revocation.

## Platform status

- Xbox: OAuth redirect and code exchange are implemented through Microsoft Identity. A separate approved Xbox data API/permission is needed to read a player library.
- PlayStation: OAuth redirect and token exchange are configurable from the partner portal. Fill in the authorised endpoints and library endpoint once Sony has issued them; those endpoints are not public constants.
- Steam: sign-in and library import should be added using Steam OpenID plus the owned-games endpoint; it needs a verified Steam ID and Web API key.
