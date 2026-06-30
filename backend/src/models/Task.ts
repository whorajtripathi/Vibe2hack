import mongoose, { Schema } from 'mongoose';

const TaskSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' }, // Work, Study, Personal, etc.
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  estimatedTime: { type: Number, required: true }, // in hours
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'archived'], default: 'pending' },
  colorLabel: { type: String, default: '#3b82f6' }, // blue hex code
  recurring: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TaskSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Task', TaskSchema);
