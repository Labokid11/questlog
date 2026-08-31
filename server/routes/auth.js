import { Router } from 'express';
import User from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';

const router = Router();

const pub = (u) => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  avatar: u.avatar,
  favouritePlatform: u.favouritePlatform,
  onboarded: u.onboarded,
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, username and password are required' });
    }
    if (String(username).trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ error: 'Email or username already taken' });

    const user = await User.create({ email, password, username });
    res.status(201).json({ token: signToken(user._id), user: pub(user) });
  } catch {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ token: signToken(user._id), user: pub(user) });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Current user
router.get('/me', protect, async (req, res) => {
  res.json({ user: pub(req.user) });
});

// Onboarding
router.put('/onboarding', protect, async (req, res) => {
  try {
    const { username, avatar, favouritePlatform } = req.body;
    if (username !== undefined) {
      if (String(username).trim().length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }
      req.user.username = username;
    }
    if (avatar !== undefined) req.user.avatar = avatar;
    if (favouritePlatform !== undefined) req.user.favouritePlatform = favouritePlatform;
    req.user.onboarded = true;
    await req.user.save();
    res.json({ user: pub(req.user) });
  } catch {
    res.status(500).json({ error: 'Onboarding failed' });
  }
});

export default router;
