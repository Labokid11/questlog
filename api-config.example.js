// Copy this file to api-config.js on your server. Never commit real secrets.
export const platformConfig = {
  steam: { apiKey: 'YOUR_STEAM_WEB_API_KEY', returnUrl: 'https://your-domain.com/auth/steam/callback' },
  xbox: { clientId: 'YOUR_MICROSOFT_ENTRA_APP_CLIENT_ID', tenant: 'consumers', redirectUri: 'https://your-domain.com/auth/xbox/callback' }
};
