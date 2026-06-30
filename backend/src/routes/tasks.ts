import { Router, Response } from 'express';
import Task from '../models/Task';
import { AuthenticatedRequest, authenticateToken } from '../middlewares/auth';

const router = Router();

// Get all tasks for authenticated user
router.get('/', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await Task.find({ user: req.user?.id }).sort({ deadline: 1 });
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create task
router.post('/', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, priority, difficulty, estimatedTime, deadline, colorLabel, recurring } = req.body;

    if (!title || !estimatedTime || !deadline) {
      return res.status(400).json({ message: 'Title, estimatedTime, and deadline are required.' });
    }

    const newTask = new Task({
      user: req.user?.id,
      title,
      description,
      category,
      priority,
      difficulty,
      estimatedTime,
      deadline: new Date(deadline),
      colorLabel,
      recurring
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update task
router.put('/:id', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user?.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized.' });
    }

    const { title, description, category, priority, difficulty, estimatedTime, deadline, status, colorLabel, recurring } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (difficulty !== undefined) task.difficulty = difficulty;
    if (estimatedTime !== undefined) task.estimatedTime = estimatedTime;
    if (deadline !== undefined) task.deadline = new Date(deadline);
    if (status !== undefined) task.status = status;
    if (colorLabel !== undefined) task.colorLabel = colorLabel;
    if (recurring !== undefined) task.recurring = recurring;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete('/:id', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized.' });
    }
    res.json({ message: 'Task deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle Task Completion
router.put('/:id/toggle-complete', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user?.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized.' });
    }

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
