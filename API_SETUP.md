# Connecting real game accounts

This front end deliberately contains no API secrets. Put platform credentials in server-side environment variables and keep the API callbacks on a backend.

## Steam

1. Create a Steam Web API key at the Steam community developer page.
2. Implement Steam OpenID sign-in on `GET /auth/steam` and validate the returned identity on `GET /auth/steam/callback`.
3. On the server, use the key to call the owned-games endpoint for the verified Steam ID. Send only the normalized game list to Questlog.

## Xbox

1. Register an app in Microsoft Entra and add the exact production callback URL.
2. Use OAuth 2.0 authorization-code flow with PKCE. Store refresh tokens encrypted on the server.
3. Do not put a Microsoft client secret in browser JavaScript.

## PlayStation

PlayStation integrations require approved partner access. Leave it disabled until credentials and permitted endpoints are available.

Use `api-config.example.js` as a field reference only; a deployed app should use server environment variables instead.
