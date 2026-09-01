import User from '../models/User.js';

export async function seedAdmin() {
  try {
    const existing = await User.findOne({ email: 'admin@questlog.dev' });
    if (existing) {
      if (existing.role !== 'admin' || existing.premiumTier !== 'pro') {
        existing.role = 'admin';
        existing.premiumTier = 'pro';
        await existing.save();
      }
      return;
    }
    await User.create({
      username: 'preet',
      email: 'admin@questlog.dev',
      password: 'admin123456',
      role: 'admin',
      premiumTier: 'pro',
      onboarded: true,
    });
    console.log('Admin account seeded: admin@questlog.dev / admin123456');
  } catch (e) {
    console.error('Failed to seed admin:', e.message);
  }
}
