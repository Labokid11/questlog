import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';
import activityRoutes from './routes/activities.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Uploaded poster images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Web frontend (static)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/activities', activityRoutes);

// SPA fallback — serve index.html for any non-API route
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const start = async () => {
  await connectDB();
  app.listen(port, '0.0.0.0', () => console.log(`Questlog API running on port ${port}`));
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
