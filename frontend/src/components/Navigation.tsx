import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Zap, 
  Timer, 
  User as UserIcon, 
  LogOut, 
  Bell, 
  Check, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Smart Schedule', path: '/calendar', icon: CalendarDays },
    { name: 'Habit Tracker', path: '/habits', icon: Zap },
    { name: 'Focus Mode', path: '/focus', icon: Timer },
    { name: 'Profile Settings', path: '/profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden w-full h-16 glass-panel px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-blue to-primary-purple flex items-center justify-center shadow-glow-blue">
            <span className="font-bold text-white text-sm">LM</span>
          </div>
          <span className="font-bold tracking-tight text-white">LastMinute Hero</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Bell Icon Mobile */}
          <div className="relative">
            <button 
              onClick={() => setBellOpen(!bellOpen)}
              className="p-2 rounded-lg bg-slate-800/40 text-slate-300 hover:text-white"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              )}
            </button>
          </div>

          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-slate-800/40 text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/5 z-40">
        {/* Logo Section */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-blue to-primary-purple flex items-center justify-center shadow-glow-blue">
            <Sparkles size={16} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight leading-none text-base">LastMinute Hero</h1>
            <span className="text-[10px] text-primary-blue font-semibold uppercase tracking-wider">AI Productivity</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-primary-blue/20 to-primary-purple/10 text-white border border-primary-blue/25 shadow-glow-blue' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Notifications & User section at the bottom */}
        <div className="p-4 border-t border-white/5 space-y-4">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/20 hover:bg-slate-800/40 text-slate-300 hover:text-white border border-white/5 text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <Bell size={16} className={unreadCount > 0 ? "animate-bounce text-primary-purple" : ""} />
                <span>Inbox Alerts</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary-blue text-white font-bold">{unreadCount}</span>
              )}
            </button>
          </div>

          {/* User profile */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-blue/50 to-primary-purple/50 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden leading-tight">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-md z-40 flex flex-col p-6 space-y-6">
          <nav className="flex-1 space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-4 rounded-xl font-semibold text-base transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary-blue/20 to-primary-purple/10 text-white border border-primary-blue/25' 
                    : 'text-slate-400 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            className="w-full py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Notifications Drawer/Dropdown Backdrop */}
      {bellOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setBellOpen(false)}
        />
      )}

      {/* Notifications Dropdown Card */}
      {bellOpen && (
        <div className="fixed md:absolute md:bottom-24 md:left-64 md:top-auto top-20 right-4 left-4 md:right-auto md:w-80 max-h-[400px] rounded-2xl glass-panel shadow-2xl border border-white/10 z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
            <span className="font-bold text-white text-sm">System & AI Alerts</span>
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-[10px] font-semibold text-slate-400 hover:text-white uppercase tracking-wider"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No alerts at this time.
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    n.read 
                      ? 'bg-slate-800/10 border-white/5 text-slate-400' 
                      : n.type === 'warning' 
                        ? 'bg-red-500/10 border-red-500/20 text-slate-100 hover:bg-red-500/15'
                        : 'bg-primary-blue/10 border-primary-blue/20 text-slate-100 hover:bg-primary-blue/15'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-xs font-bold ${n.type === 'warning' ? 'text-red-400' : 'text-primary-blue'}`}>
                      {n.title}
                    </span>
                    {!n.read && (
                      <button 
                        onClick={() => markAsRead(n._id)}
                        className="p-0.5 rounded bg-white/5 text-slate-400 hover:text-white"
                        title="Mark as Read"
                      >
                        <Check size={10} />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] mt-1 leading-normal">{n.message}</p>
                  <p className="text-[9px] text-slate-500 mt-2">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
