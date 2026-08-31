import { Router } from 'express';
import Game from '../models/Game.js';
import Session from '../models/Session.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// Aggregated stats for the current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const games = await Game.find({ user: userId });

    const totalMinutes = games.reduce((sum, g) => sum + (g.totalMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const completed = games.filter((g) => g.status === 'completed').length;
    const playing = games.filter((g) => g.status === 'playing').length;

    // Platforms used
    const platforms = {};
    games.forEach((g) => {
      if (g.platform) platforms[g.platform] = (platforms[g.platform] || 0) + (g.totalMinutes || 0);
    });
    const platformsUsed = Object.keys(platforms).length;

    // Genres played
    const genres = {};
    games.forEach((g) => {
      if (g.genre) genres[g.genre] = (genres[g.genre] || 0) + (g.totalMinutes || 0);
    });
    const genresPlayed = Object.keys(genres).length;

    // Status breakdown
    const statusBreakdown = { backlog: 0, playing: 0, completed: 0, abandoned: 0 };
    games.forEach((g) => { statusBreakdown[g.status] = (statusBreakdown[g.status] || 0) + 1; });

    // Sessions over the last 14 days (minutes per day)
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);
    const sessions = await Session.find({ user: userId, date: { $gte: since } }).sort({ date: 1 });
    const dailyMap = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    sessions.forEach((s) => {
      const key = new Date(s.date).toISOString().slice(0, 10);
      if (dailyMap[key] !== undefined) dailyMap[key] += s.minutes;
    });
    const dailySeries = Object.entries(dailyMap).map(([date, minutes]) => ({ date, minutes }));

    // Streaks based on session days
    const allSessions = await Session.find({ user: userId }).select('date');
    const dayKeys = [...new Set(allSessions.map((s) => new Date(s.date).toISOString().slice(0, 10)))].sort();
    const streaks = computeStreaks(dayKeys);

    res.json({
      totalGames: games.length,
      totalHours,
      totalMinutes,
      completed,
      playing,
      platformsUsed,
      platforms: Object.entries(platforms).map(([name, minutes]) => ({ name, minutes })).sort((a, b) => b.minutes - a.minutes),
      genresPlayed,
      genres: Object.entries(genres).map(([name, minutes]) => ({ name, minutes })).sort((a, b) => b.minutes - a.minutes),
      statusBreakdown,
      dailySeries,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
    });
  } catch (e) {
    res.status(500).json({ error: 'Could not load stats' });
  }
});

function computeStreaks(dayKeys) {
  if (!dayKeys.length) return { current: 0, longest: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  // Current streak: count back from today (or yesterday if no session today yet)
  let cursor;
  if (dayKeys.includes(todayKey)) cursor = todayKey;
  else if (dayKeys.includes(yesterdayKey)) cursor = yesterdayKey;
  else return { current: 0, longest: computeLongest(dayKeys) };

  let current = 0;
  const set = new Set(dayKeys);
  let d = new Date(cursor + 'T00:00:00');
  while (set.has(d.toISOString().slice(0, 10))) {
    current++;
    d.setDate(d.getDate() - 1);
  }
  return { current, longest: Math.max(current, computeLongest(dayKeys)) };
}

function computeLongest(dayKeys) {
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const key of dayKeys) {
    const d = new Date(key + 'T00:00:00');
    if (prev) {
      const diff = Math.round((d - prev) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }
  return longest;
}

export default router;
