import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['warning', 'info', 'recommendation'], default: 'info' },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', NotificationSchema);
