import { Router, Response } from 'express';
import Notification from '../models/Notification';
import Task from '../models/Task';
import { AuthenticatedRequest, authenticateToken } from '../middlewares/auth';

const router = Router();

// Get user notifications, with on-the-fly deadline risk checking
router.get('/', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Proactively scan tasks for deadline risk alerts and insert them
    const activeTasks = await Task.find({ user: userId, status: { $ne: 'completed' } });
    const now = Date.now();

    for (const task of activeTasks) {
      const timeLeftHours = (new Date(task.deadline).getTime() - now) / (1000 * 60 * 60);
      const estTime = task.estimatedTime || 1;

      // 1. Extreme Risk: estimated time exceeds remaining time before deadline
      if (timeLeftHours > 0 && timeLeftHours < estTime) {
        const exist = await Notification.findOne({ user: userId, taskId: task._id, type: 'warning', read: false });
        if (!exist) {
          await new Notification({
            user: userId,
            title: 'Critical Deadline Alert',
            message: `"${task.title}" requires about ${estTime}h to finish, but you only have ${Math.round(timeLeftHours)}h left before the deadline!`,
            type: 'warning',
            taskId: task._id
          }).save();
        }
      } 
      // 2. Urgent: Less than 24 hours left
      else if (timeLeftHours > 0 && timeLeftHours < 24) {
        const exist = await Notification.findOne({ user: userId, taskId: task._id, read: false });
        if (!exist) {
          await new Notification({
            user: userId,
            title: 'Urgent Task',
            message: `"${task.title}" is due in less than 24 hours. Start preparing now!`,
            type: 'info',
            taskId: task._id
          }).save();
        }
      }
    }

    // Fetch the notifications
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Clear all notifications
router.delete('/', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Notification.deleteMany({ user: req.user?.id });
    res.json({ message: 'All notifications cleared.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
