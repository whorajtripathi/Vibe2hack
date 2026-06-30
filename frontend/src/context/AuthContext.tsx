import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api.ts';

interface ProfileSettings {
  sleepTime: string;
  wakeTime: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  preferredStudyTime: string;
  darkMode: boolean;
  notificationPreferences: {
    deadlineWarnings: boolean;
    aiInsights: boolean;
    habitReminders: boolean;
  };
  aiPreferences: {
    style: 'supportive' | 'tough_love' | 'balanced';
    priorityFocus: 'urgency' | 'importance' | 'balanced';
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  profile: ProfileSettings;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<ProfileSettings>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const data = await api.get('/api/auth/me');
      setUser({
        id: data._id,
        name: data.name,
        email: data.email,
        profile: data.profile
      });
    } catch (err: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        profile: data.user.profile
      });
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/api/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        profile: data.user.profile
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateProfile = async (profileData: Partial<ProfileSettings>) => {
    setError(null);
    try {
      const data = await api.put('/api/auth/profile', profileData);
      if (user) {
        setUser({
          ...user,
          profile: data.profile
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile settings.');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
