import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    platform: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['backlog', 'playing', 'completed', 'abandoned'],
      default: 'backlog',
    },
    posterUrl: { type: String, default: '' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    notes: { type: String, default: '' },
    description: { type: String, default: '' },
    genre: { type: String, default: '', trim: true },
    totalMinutes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Game', gameSchema);
