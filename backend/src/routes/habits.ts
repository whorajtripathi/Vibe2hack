import { Router, Response } from 'express';
import Habit from '../models/Habit';
import { AuthenticatedRequest, authenticateToken } from '../middlewares/auth';

const router = Router();

// Get all habits for the authenticated user
router.get('/', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const habits = await Habit.find({ user: req.user?.id });
    res.json(habits);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle Habit completion on a specific date (YYYY-MM-DD)
router.post('/:id/toggle', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date } = req.body; // expected format: 'YYYY-MM-DD'
    if (!date) {
      return res.status(400).json({ message: 'Date is required (YYYY-MM-DD).' });
    }

    const habit = await Habit.findOne({ _id: req.params.id, user: req.user?.id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized.' });
    }

    const logIndex = habit.logs.indexOf(date);
    if (logIndex > -1) {
      // Remove date if already logged (undo completion)
      habit.logs.splice(logIndex, 1);
    } else {
      // Add date
      habit.logs.push(date);
    }

    // Recalculate streak
    // Sort logs chronologically
    const sortedLogs = [...habit.logs].sort();
    
    let currentStreak = 0;
    if (sortedLogs.length > 0) {
      // Convert dates to timestamps (ignoring timezone issues for simple comparison)
      const parseDate = (dStr: string) => {
        const parts = dStr.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Find the last completed date
      const lastCompletedStr = sortedLogs[sortedLogs.length - 1];
      const lastCompletedDate = parseDate(lastCompletedStr);

      // If the last completion was today or yesterday, streak is active
      if (lastCompletedDate.getTime() === today.getTime() || lastCompletedDate.getTime() === yesterday.getTime()) {
        currentStreak = 1;
        let prevDate = lastCompletedDate;

        // Traverse backward
        for (let i = sortedLogs.length - 2; i >= 0; i--) {
          const checkDate = parseDate(sortedLogs[i]);
          const diffTime = prevDate.getTime() - checkDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
            prevDate = checkDate;
          } else if (diffDays > 1) {
            break; // streak broken
          }
          // if diffDays === 0, it is a duplicate logged date (ignore)
        }
      }
    }

    habit.streak = currentStreak;
    if (currentStreak > habit.bestStreak) {
      habit.bestStreak = currentStreak;
    }

    await habit.save();
    res.json(habit);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create new custom habit
router.post('/', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Habit name is required.' });
    }

    const newHabit = new Habit({
      user: req.user?.id,
      name,
      logs: [],
      streak: 0,
      bestStreak: 0
    });

    const savedHabit = await newHabit.save();
    res.status(201).json(savedHabit);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Delete custom habit
router.delete('/:id', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized.' });
    }
    res.json({ message: 'Habit deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
