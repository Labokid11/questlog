import { Router } from 'express';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

const pub = (u) => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  avatar: u.avatar,
  favouritePlatform: u.favouritePlatform,
  onboarded: u.onboarded,
  premiumTier: u.premiumTier,
  role: u.role,
  theme: u.theme,
});

const VALID_CODES = new Set([
  'QUESTLOG-PRO',
  'PREMIUM-2024',
  'GAMER-FOREVER',
  'UNLOCK-PRO',
  ...(process.env.PREMIUM_CODE ? [process.env.PREMIUM_CODE.toUpperCase()] : []),
]);

// Unlock premium with a code
router.post('/premium/unlock', async (req, res) => {
  try {
    const code = String(req.body.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Please enter a premium code' });
    if (!VALID_CODES.has(code)) return res.status(403).json({ error: 'Invalid premium code' });
    if (req.user.premiumTier === 'pro') return res.json({ user: pub(req.user), message: 'Already Premium' });
    req.user.premiumTier = 'pro';
    await req.user.save();
    res.json({ user: pub(req.user), message: 'Premium unlocked!' });
  } catch {
    res.status(500).json({ error: 'Could not unlock premium' });
  }
});

// Developer toggle (toggles the current user's premium)
router.post('/premium/toggle', async (req, res) => {
  try {
    req.user.premiumTier = req.user.premiumTier === 'pro' ? 'free' : 'pro';
    await req.user.save();
    res.json({ user: pub(req.user) });
  } catch {
    res.status(500).json({ error: 'Could not toggle premium' });
  }
});

// Save theme preference
router.put('/theme', async (req, res) => {
  try {
    const theme = String(req.body.theme || 'default');
    req.user.theme = theme;
    await req.user.save();
    res.json({ user: pub(req.user) });
  } catch {
    res.status(500).json({ error: 'Could not save theme' });
  }
});

export default router;
