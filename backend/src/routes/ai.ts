import { Router, Response } from 'express';
import Task from '../models/Task';
import Habit from '../models/Habit';
import User from '../models/User';
import Notification from '../models/Notification';
import { generateAIPlan } from '../services/gemini';
import { AuthenticatedRequest, authenticateToken } from '../middlewares/auth';

const router = Router();

// Store the latest plan in memory per user for simple caching/retrieval (or return generated directly)
const planCache: { [userId: string]: any } = {};

// Generate AI Productivity Plan
router.post('/plan', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Fetch all user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const tasks = await Task.find({ user: userId });
    const habits = await Habit.find({ user: userId });

    // Call Gemini API service
    const aiPlan = await generateAIPlan(tasks, habits, user.profile);

    // Save plan in memory cache
    planCache[userId as string] = aiPlan;

    // Proactively generate notifications for any AI warnings that were identified
    if (aiPlan.warnings && aiPlan.warnings.length > 0) {
      const notificationPromises = aiPlan.warnings.map(async (w) => {
        // Check if an unread notification with this warning already exists
        const exist = await Notification.findOne({
          user: userId,
          message: w.message,
          read: false
        });

        if (!exist) {
          const type = w.type === 'high_risk' ? 'warning' : 'info';
          return new Notification({
            user: userId,
            title: w.type === 'high_risk' ? 'AI High Risk Warning' : 'AI Priority Advisory',
            message: w.message,
            type,
            taskId: w.taskId
          }).save();
        }
      });
      await Promise.all(notificationPromises);
    }

    res.json(aiPlan);
  } catch (err: any) {
    console.error('AI Plan Route Error:', err);
    res.status(500).json({ message: 'Failed to generate AI Plan.', error: err.message });
  }
});

// Get Latest Cached Recommendations
router.get('/recommendations', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const cachedPlan = planCache[userId as string];

    if (!cachedPlan) {
      // Return a set of default suggestions if no plan has been generated yet
      return res.json({
        recommendations: [
          'Generate your first AI Plan using the button on the dashboard to see smart recommendations.',
          'Add your tasks for today and set realistic estimates for best AI performance.',
          'Log your wake, sleep, and work hours in your Profile Settings to personalize recommendations.'
        ],
        productivityTips: [
          'The 2-Minute Rule: If a task takes less than two minutes, do it now.',
          'Protect your high-energy hours. Focus on complex cognitive tasks during these peaks.'
        ],
        motivation: 'Welcome to LastMinute Hero. Together, we will stay ahead of the clock!'
      });
    }

    res.json({
      recommendations: cachedPlan.recommendations,
      productivityTips: cachedPlan.productivityTips,
      motivation: cachedPlan.motivation
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
