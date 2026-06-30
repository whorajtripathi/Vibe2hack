import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api.ts';
import { useAuth } from './AuthContext.tsx';

export interface Habit {
  _id: string;
  name: string;
  logs: string[]; // YYYY-MM-DD completion dates
  streak: number;
  bestStreak: number;
  createdAt: string;
}

interface HabitContextType {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  toggleHabit: (id: string, date: string) => Promise<void>;
  createHabit: (name: string) => Promise<Habit>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/habits');
      setHabits(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch habits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHabits();
    } else {
      setHabits([]);
    }
  }, [user]);

  const toggleHabit = async (id: string, date: string) => {
    setError(null);
    try {
      const updated = await api.post(`/api/habits/${id}/toggle`, { date });
      setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
    } catch (err: any) {
      setError(err.message || 'Failed to toggle habit completion.');
      throw err;
    }
  };

  const createHabit = async (name: string) => {
    setError(null);
    try {
      const habit = await api.post('/api/habits', { name });
      setHabits((prev) => [...prev, habit]);
      return habit;
    } catch (err: any) {
      setError(err.message || 'Failed to create habit.');
      throw err;
    }
  };

  return (
    <HabitContext.Provider value={{ habits, loading, error, fetchHabits, toggleHabit, createHabit }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
