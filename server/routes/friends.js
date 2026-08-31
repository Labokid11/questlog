import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Activity from '../models/Activity.js';
import Session from '../models/Session.js';
import Follow from '../models/Follow.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

const pubUser = (u) => ({
  _id: u._id,
  username: u.username,
  avatar: u.avatar,
  favouritePlatform: u.favouritePlatform,
});

// Search users by username (for adding friends)
router.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 1) return res.json([]);
  const users = await User.find({
    _id: { $ne: req.user._id },
    username: { $regex: q, $options: 'i' },
  })
    .limit(10)
    .select('username avatar favouritePlatform');
  res.json(users.map(pubUser));
});

// List friends (users I follow) with their stats
router.get('/', async (req, res) => {
  const follows = await Follow.find({ follower: req.user._id }).populate('following', 'username avatar favouritePlatform');
  const friends = await Promise.all(
    follows.map(async (f) => {
      const u = f.following;
      const gameCount = await Game.countDocuments({ user: u._id });
      const completed = await Game.countDocuments({ user: u._id, status: 'completed' });
      return { ...pubUser(u), gameCount, completed, since: f.createdAt };
    })
  );
  res.json(friends);
});

// Follow a user
router.post('/:id', async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === String(req.user._id)) return res.status(400).json({ error: 'You cannot follow yourself' });
    if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ error: 'Invalid user' });
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ error: 'User not found' });
    const exists = await Follow.findOne({ follower: req.user._id, following: targetId });
    if (exists) return res.status(409).json({ error: 'Already following' });
    await Follow.create({ follower: req.user._id, following: targetId });
    res.status(201).json({ ok: true, user: pubUser(target) });
  } catch {
    res.status(500).json({ error: 'Could not follow user' });
  }
});

// Unfollow a user
router.delete('/:id', async (req, res) => {
  try {
    await Follow.findOneAndDelete({ follower: req.user._id, following: req.params.id });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Could not unfollow' });
  }
});

// View a friend's library
router.get('/:id/library', async (req, res) => {
  const isFriend = await Follow.findOne({ follower: req.user._id, following: req.params.id });
  if (!isFriend) return res.status(403).json({ error: 'You can only view friends' });
  const games = await Game.find({ user: req.params.id }).sort({ createdAt: -1 }).select('-user');
  res.json(games);
});

// View a friend's activity
router.get('/:id/activity', async (req, res) => {
  const isFriend = await Follow.findOne({ follower: req.user._id, following: req.params.id });
  if (!isFriend) return res.status(403).json({ error: 'You can only view friends' });
  const activities = await Activity.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(50);
  res.json(activities);
});

// Compare progress with a friend
router.get('/:id/compare', async (req, res) => {
  const isFriend = await Follow.findOne({ follower: req.user._id, following: req.params.id });
  if (!isFriend) return res.status(403).json({ error: 'You can only view friends' });
  const friend = await User.findById(req.params.id).select('username avatar favouritePlatform');
  const myGames = await Game.find({ user: req.user._id });
  const theirGames = await Game.find({ user: req.params.id });

  const myStats = {
    total: myGames.length,
    completed: myGames.filter((g) => g.status === 'completed').length,
    hours: Math.round((myGames.reduce((s, g) => s + (g.totalMinutes || 0), 0) / 60) * 10) / 10,
  };
  const theirStats = {
    total: theirGames.length,
    completed: theirGames.filter((g) => g.status === 'completed').length,
    hours: Math.round((theirGames.reduce((s, g) => s + (g.totalMinutes || 0), 0) / 60) * 10) / 10,
  };

  // Shared games by title (case-insensitive)
  const theirByTitle = new Map();
  theirGames.forEach((g) => theirByTitle.set(g.title.toLowerCase(), g));
  const shared = myGames
    .filter((g) => theirByTitle.has(g.title.toLowerCase()))
    .map((g) => {
      const t = theirByTitle.get(g.title.toLowerCase());
      return { title: g.title, myProgress: g.progress, theirProgress: t.progress, myStatus: g.status, theirStatus: t.status };
    });

  res.json({ friend: pubUser(friend), myStats, theirStats, shared });
});

export default router;
