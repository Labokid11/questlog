import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
    gameTitle: { type: String, default: '' },
    minutes: { type: Number, required: true, min: 1 },
    date: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
