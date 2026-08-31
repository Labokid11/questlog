import { Router } from 'express';
import Game from '../models/Game.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(protect);

// List user's games
router.get('/', async (req, res) => {
  const games = await Game.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(games);
});

// Add a game (poster upload via multipart or posterUrl in body)
router.post('/', upload.single('poster'), async (req, res) => {
  try {
    const { title, platform, status, posterUrl, progress, rating, notes } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const finalPoster = req.file ? `/uploads/${req.file.filename}` : posterUrl || '';
    const game = await Game.create({
      user: req.user._id,
      title,
      platform: platform || '',
      status: status || 'backlog',
      posterUrl: finalPoster,
      progress: Number(progress) || 0,
      rating: Number(rating) || 0,
      notes: notes || '',
    });
    await Activity.create({
      user: req.user._id,
      type: 'added_game',
      game: game._id,
      gameTitle: game.title,
      description: `added ${game.title} to their library`,
    });
    res.status(201).json(game);
  } catch {
    res.status(500).json({ error: 'Could not add game' });
  }
});

// Edit a game
router.put('/:id', upload.single('poster'), async (req, res) => {
  try {
    const game = await Game.findOne({ _id: req.params.id, user: req.user._id });
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const { title, platform, status, posterUrl, progress, rating, notes } = req.body;
    const prevStatus = game.status;
    const prevProgress = game.progress;

    if (title !== undefined) game.title = title;
    if (platform !== undefined) game.platform = platform;
    if (status !== undefined) game.status = status;
    if (req.file) game.posterUrl = `/uploads/${req.file.filename}`;
    else if (posterUrl !== undefined) game.posterUrl = posterUrl;
    if (progress !== undefined) game.progress = Number(progress);
    if (rating !== undefined) game.rating = Number(rating);
    if (notes !== undefined) game.notes = notes;

    await game.save();

    // Generate activity entries for meaningful changes
    if (status && status !== prevStatus) {
      if (status === 'completed') {
        await Activity.create({
          user: req.user._id,
          type: 'finished_game',
          game: game._id,
          gameTitle: game.title,
          description: `finished ${game.title}`,
        });
      } else if (status === 'playing' && prevStatus !== 'playing') {
        await Activity.create({
          user: req.user._id,
          type: 'started_game',
          game: game._id,
          gameTitle: game.title,
          description: `started playing ${game.title}`,
        });
      }
    }
    if (progress !== undefined && Number(progress) !== prevProgress && Number(progress) > 0) {
      await Activity.create({
        user: req.user._id,
        type: 'updated_progress',
        game: game._id,
        gameTitle: game.title,
        description: `updated progress on ${game.title} to ${progress}%`,
      });
    }

    res.json(game);
  } catch {
    res.status(500).json({ error: 'Could not update game' });
  }
});

// Remove a game
router.delete('/:id', async (req, res) => {
  try {
    const game = await Game.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!game) return res.status(404).json({ error: 'Game not found' });
    await Activity.create({
      user: req.user._id,
      type: 'removed_game',
      gameTitle: game.title,
      description: `removed ${game.title} from their library`,
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Could not delete game' });
  }
});

export default router;
