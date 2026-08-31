import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const SECRET = () => process.env.JWT_SECRET || 'dev-secret-change-me';

export async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], SECRET());
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export const signToken = (id) => jwt.sign({ id }, SECRET(), { expiresIn: '7d' });
