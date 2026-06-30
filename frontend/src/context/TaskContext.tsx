import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api.ts';
import { useAuth } from './AuthContext.tsx';

export interface Task {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  colorLabel: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
}

export interface AIPriority {
  taskId: string;
  title: string;
  rank: number;
  reason: string;
}

export interface AISchedule {
  time: string;
  activity: string;
  taskId?: string;
  type: 'work' | 'break' | 'meal' | 'sleep';
}

export interface AIWarning {
  taskId?: string;
  type: 'high_risk' | 'medium_risk' | 'low_risk';
  message: string;
}

export interface AIPlan {
  priorityRanking: AIPriority[];
  todaySchedule: AISchedule[];
  warnings: AIWarning[];
  recommendations: string[];
  productivityTips: string[];
  motivation: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  aiPlan: AIPlan | null;
  generatingAIPlan: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Omit<Task, '_id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  generatePlan: () => Promise<AIPlan>;
  fetchRecommendations: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null);
  const [generatingAIPlan, setGeneratingAIPlan] = useState(false);

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/tasks');
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchRecommendations();
    } else {
      setTasks([]);
      setAiPlan(null);
    }
  }, [user]);

  const createTask = async (taskData: Omit<Task, '_id' | 'createdAt'>) => {
    setError(null);
    try {
      const task = await api.post('/api/tasks', taskData);
      setTasks((prev) => [...prev, task].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
      return task;
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
      throw err;
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    setError(null);
    try {
      const updated = await api.put(`/api/tasks/${id}`, taskData);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update task.');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    setError(null);
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete task.');
      throw err;
    }
  };

  const toggleComplete = async (id: string) => {
    setError(null);
    try {
      const updated = await api.put(`/api/tasks/${id}/toggle-complete`);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err: any) {
      setError(err.message || 'Failed to toggle completion status.');
      throw err;
    }
  };

  const generatePlan = async () => {
    setGeneratingAIPlan(true);
    setError(null);
    try {
      const plan = await api.post('/api/ai/plan');
      setAiPlan(plan);
      return plan;
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI plan.');
      throw err;
    } finally {
      setGeneratingAIPlan(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const data = await api.get('/api/ai/recommendations');
      // If a plan exists in cache, populate aiPlan
      if (data && data.recommendations && data.recommendations[0]?.indexOf('Generate your first') === -1) {
        // Mock format can be updated
        setAiPlan(prev => prev ? prev : {
          priorityRanking: [],
          todaySchedule: [],
          warnings: [],
          recommendations: data.recommendations,
          productivityTips: data.productivityTips,
          motivation: data.motivation
        });
      }
    } catch (err) {
      console.warn('Failed to load initial suggestions panel:', err);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        aiPlan,
        generatingAIPlan,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleComplete,
        generatePlan,
        fetchRecommendations
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
