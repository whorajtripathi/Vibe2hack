import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    sleepTime: { type: String, default: '23:00' },
    wakeTime: { type: String, default: '07:00' },
    workingHoursStart: { type: String, default: '09:00' },
    workingHoursEnd: { type: String, default: '17:00' },
    preferredStudyTime: { type: String, default: 'evening' }, // morning, afternoon, evening, night
    darkMode: { type: Boolean, default: true },
    notificationPreferences: {
      deadlineWarnings: { type: Boolean, default: true },
      aiInsights: { type: Boolean, default: true },
      habitReminders: { type: Boolean, default: true }
    },
    aiPreferences: {
      style: { type: String, default: 'supportive' }, // supportive, tough_love, balanced
      priorityFocus: { type: String, default: 'balanced' } // urgency, importance, balanced
    }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
