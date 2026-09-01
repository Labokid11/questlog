import { Router } from 'express';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Activity from '../models/Activity.js';
import Session from '../models/Session.js';
import Follow from '../models/Follow.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(protect, requireAdmin);

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
  createdAt: u.createdAt,
});

// List all users with game counts
router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const result = await Promise.all(
    users.map(async (u) => {
      const gameCount = await Game.countDocuments({ user: u._id });
      return { ...pub(u), gameCount };
    })
  );
  res.json(result);
});

// Toggle premium for any user
router.post('/user/:id/premium', async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    u.premiumTier = u.premiumTier === 'pro' ? 'free' : 'pro';
    await u.save();
    res.json({ user: pub(u) });
  } catch {
    res.status(500).json({ error: 'Could not toggle premium' });
  }
});

// Reset a user's data (games, sessions, activities)
router.post('/user/:id/reset', async (req, res) => {
  try {
    await Game.deleteMany({ user: req.params.id });
    await Session.deleteMany({ user: req.params.id });
    await Activity.deleteMany({ user: req.params.id });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Could not reset user data' });
  }
});

// Remove a user entirely
router.delete('/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Game.deleteMany({ user: req.params.id });
    await Session.deleteMany({ user: req.params.id });
    await Activity.deleteMany({ user: req.params.id });
    await Follow.deleteMany({ $or: [{ follower: req.params.id }, { following: req.params.id }] });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Could not remove user' });
  }
});

// App-wide analytics
router.get('/analytics', async (req, res) => {
  try {
    const [totalUsers, proUsers, adminUsers, totalGames, totalSessions, totalActivities] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ premiumTier: 'pro' }),
      User.countDocuments({ role: 'admin' }),
      Game.countDocuments(),
      Session.countDocuments(),
      Activity.countDocuments(),
    ]);
    res.json({ totalUsers, proUsers, adminUsers, totalGames, totalSessions, totalActivities });
  } catch {
    res.status(500).json({ error: 'Could not load analytics' });
  }
});

export default router;
