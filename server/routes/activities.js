import { Router } from 'express';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// List activities (newest first)
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const activities = await Activity.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json(activities);
});

// Post a custom activity
router.post('/', async (req, res) => {
  try {
    const { type, gameTitle, description } = req.body;
    if (!type) return res.status(400).json({ error: 'Activity type is required' });
    const activity = await Activity.create({
      user: req.user._id,
      type,
      gameTitle: gameTitle || '',
      description: description || '',
    });
    res.status(201).json(activity);
  } catch {
    res.status(500).json({ error: 'Could not post activity' });
  }
});

export default router;
