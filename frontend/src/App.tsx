import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { TaskProvider } from './context/TaskContext.tsx';
import { HabitProvider } from './context/HabitContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';

// Import Pages
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import FocusPage from './pages/FocusPage.tsx';
import CalendarPage from './pages/CalendarPage.tsx';
import HabitsPage from './pages/HabitsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';

// Import Layout Components
import Navigation from './components/Navigation.tsx';

// Protection Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-blue/20 border-t-primary-blue animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium">Hero loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Main layout that conditional includes sidebar/header
const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col md:flex-row relative">
      {/* Background Glowing Orbs */}
      <div className="bg-glow-spot bg-primary-blue top-[-100px] left-[-100px]" />
      <div className="bg-glow-spot bg-primary-purple bottom-[-100px] right-[-100px] opacity-10" />

      {user && !isAuthPage && <Navigation />}
      
      <main className={`flex-1 w-full relative z-10 ${user && !isAuthPage ? 'md:pl-64 min-h-screen' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/focus" element={<ProtectedRoute><FocusPage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <TaskProvider>
          <HabitProvider>
            <NotificationProvider>
              <AppLayout />
            </NotificationProvider>
          </HabitProvider>
        </TaskProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
