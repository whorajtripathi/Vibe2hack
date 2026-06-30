import mongoose, { Schema } from 'mongoose';

const HabitSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // e.g. Exercise, Reading, Coding, Meditation, Water Intake, Study Hours
  logs: [{ type: String }], // Array of 'YYYY-MM-DD' strings
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Habit', HabitSchema);
