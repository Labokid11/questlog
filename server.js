import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import session from 'express-session';

const app = express();
const port = process.env.PORT || 3000;
const origin = process.env.APP_ORIGIN || `http://localhost:${port}`;
app.use(express.static('.'));
app.use(session({ secret: process.env.SESSION_SECRET || 'local-development-only-change-me', resave: false, saveUninitialized: false, cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' } }));

app.get('/auth/steam', (req, res) => {
  const returnTo = `${origin}/auth/steam/callback`; const params = new URLSearchParams({ 'openid.ns': 'http://specs.openid.net/auth/2.0', 'openid.mode': 'checkid_setup', 'openid.return_to': returnTo, 'openid.realm': origin, 'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select', 'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select' });
  res.redirect(`https://steamcommunity.com/openid/login?${params}`);
});
app.get('/auth/steam/callback', async (req, res) => {
  try { const verify = new URLSearchParams(req.query); verify.set('openid.mode', 'check_authentication'); const response = await fetch('https://steamcommunity.com/openid/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: verify }); if (!(await response.text()).includes('is_valid:true')) throw new Error('verification failed'); const claimedId = req.query['openid.claimed_id']; const steamId = claimedId?.match(/\/(\d+)$/)?.[1]; if (!steamId) throw new Error('missing Steam ID'); req.session.steamId = steamId; res.redirect('/?connected=steam'); }
  catch { res.status(502).send('Could not verify Steam sign-in. Please try again.'); }
});

const provider = (name, config) => {
  app.get(`/auth/${name}`, (req, res) => {
    const state = crypto.randomBytes(24).toString('hex'); req.session[`${name}State`] = state;
    if (!config.authorizeUrl) return res.status(503).send(`${name} is not configured. Add its partner credentials to .env.`);
    res.redirect(config.authorizeUrl({ state, redirectUri: `${origin}/auth/${name}/callback` }));
  });
  app.get(`/auth/${name}/callback`, async (req, res) => {
    if (!req.query.code || req.query.state !== req.session[`${name}State`]) return res.status(400).send('Invalid or expired sign-in request.');
    try { req.session[`${name}Token`] = await config.exchangeCode(req.query.code, `${origin}/auth/${name}/callback`); res.redirect('/?connected=' + name); }
    catch { res.status(502).send(`Could not finish ${name} sign-in. Check your server configuration.`); }
  });
};

provider('xbox', {
  authorizeUrl: ({ state, redirectUri }) => process.env.XBOX_CLIENT_ID && `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=${encodeURIComponent(process.env.XBOX_CLIENT_ID)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${encodeURIComponent('openid profile offline_access')}&state=${state}`,
  exchangeCode: async (code, redirectUri) => { const body = new URLSearchParams({ client_id: process.env.XBOX_CLIENT_ID, client_secret: process.env.XBOX_CLIENT_SECRET, grant_type: 'authorization_code', code, redirect_uri: redirectUri }); const response = await fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }); if (!response.ok) throw new Error('token exchange failed'); return response.json(); }
});
provider('playstation', {
  authorizeUrl: ({ state, redirectUri }) => process.env.PLAYSTATION_CLIENT_ID && process.env.PLAYSTATION_AUTHORIZE_URL && `${process.env.PLAYSTATION_AUTHORIZE_URL}?client_id=${encodeURIComponent(process.env.PLAYSTATION_CLIENT_ID)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
  exchangeCode: async (code, redirectUri) => { const body = new URLSearchParams({ client_id: process.env.PLAYSTATION_CLIENT_ID, client_secret: process.env.PLAYSTATION_CLIENT_SECRET, grant_type: 'authorization_code', code, redirect_uri: redirectUri }); const response = await fetch(process.env.PLAYSTATION_TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }); if (!response.ok) throw new Error('token exchange failed'); return response.json(); }
});

app.get('/api/connected-accounts', (req, res) => res.json({ steam: Boolean(req.session.steamId), xbox: Boolean(req.session.xboxToken), playstation: Boolean(req.session.playstationToken) }));
app.listen(port, () => console.log(`Questlog is running at ${origin}`));
