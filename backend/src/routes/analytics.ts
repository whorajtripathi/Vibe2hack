import { Router, Response } from 'express';
import Task from '../models/Task';
import Habit from '../models/Habit';
import { AuthenticatedRequest, authenticateToken } from '../middlewares/auth';

const router = Router();

// Get Productivity Analytics
router.get('/', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const tasks = await Task.find({ user: userId });
    const habits = await Habit.find({ user: userId });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');

    const completedCount = completedTasks.length;
    const pendingCount = pendingTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Focus hours: Sum estimatedTime of completed tasks
    const focusHours = completedTasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);

    // Category distribution
    const categoriesMap: { [key: string]: number } = {};
    tasks.forEach(t => {
      const cat = t.category || 'General';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoriesMap).map(name => ({
      name,
      value: categoriesMap[name]
    }));

    // Weekly activity (last 7 days completed tasks)
    const weeklyActivity = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));
      
      const dayName = dayNames[d.getDay()];

      // Count tasks completed on this day (we approximate completed date using updatedAt when task is completed)
      const count = completedTasks.filter(t => {
        const completedAt = t.updatedAt || t.createdAt;
        return completedAt >= dayStart && completedAt <= dayEnd;
      }).length;

      weeklyActivity.push({
        day: dayName,
        completed: count,
        date: dayStart.toISOString().split('T')[0]
      });
    }

    // Streaks
    const bestHabitStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

    res.json({
      completionRate,
      completedCount,
      pendingCount,
      totalTasks,
      focusHours,
      categoryDistribution,
      weeklyActivity,
      bestHabitStreak
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
