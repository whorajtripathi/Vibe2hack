import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Habit from '../models/Habit';
import { AuthenticatedRequest, authenticateToken } from '../middlewares/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lastminute_hero_secret_key_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'lastminute_hero_refresh_secret_key_67890';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Automatically create default habits for the user
    const defaultHabits = ['Exercise', 'Reading', 'Coding', 'Meditation', 'Water Intake', 'Study Hours'];
    const habitPromises = defaultHabits.map(habitName => {
      return new Habit({
        user: user._id,
        name: habitName,
        logs: [],
        streak: 0,
        bestStreak: 0
      }).save();
    });
    await Promise.all(habitPromises);

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: user._id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: user._id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required.' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token.' });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get User Profile Info (Protected)
router.get('/me', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update Profile settings
router.put('/profile', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user: any = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { sleepTime, wakeTime, workingHoursStart, workingHoursEnd, preferredStudyTime, darkMode, notificationPreferences, aiPreferences } = req.body;

    if (sleepTime !== undefined) user.profile.sleepTime = sleepTime;
    if (wakeTime !== undefined) user.profile.wakeTime = wakeTime;
    if (workingHoursStart !== undefined) user.profile.workingHoursStart = workingHoursStart;
    if (workingHoursEnd !== undefined) user.profile.workingHoursEnd = workingHoursEnd;
    if (preferredStudyTime !== undefined) user.profile.preferredStudyTime = preferredStudyTime;
    if (darkMode !== undefined) user.profile.darkMode = darkMode;
    if (notificationPreferences !== undefined) user.profile.notificationPreferences = { ...user.profile.notificationPreferences, ...notificationPreferences };
    if (aiPreferences !== undefined) user.profile.aiPreferences = { ...user.profile.aiPreferences, ...aiPreferences };

    await user.save();
    res.json({
      message: 'Profile settings updated successfully.',
      profile: user.profile
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
