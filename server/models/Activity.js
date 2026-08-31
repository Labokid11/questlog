import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'added_game',
        'started_game',
        'updated_progress',
        'finished_game',
        'rated_game',
        'removed_game',
        'played_session',
      ],
      required: true,
    },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    gameTitle: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Activity', activitySchema);
