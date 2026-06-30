import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import habitRoutes from './routes/habits';
import analyticsRoutes from './routes/analytics';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lastminute-hero';

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for local dev ease, customize for production
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LastMinute Hero Backend is operational.' });
});

// Database connection & Server Startup
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB successfully connected on port 27017');
    app.listen(PORT, () => {
      console.log(`Express server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
