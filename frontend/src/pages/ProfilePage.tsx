import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  User as UserIcon, 
  Settings2, 
  Clock, 
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, error, clearError } = useAuth();
  
  // Local Settings States initialized from profile context
  const [sleepTime, setSleepTime] = useState(user?.profile?.sleepTime || '23:00');
  const [wakeTime, setWakeTime] = useState(user?.profile?.wakeTime || '07:00');
  const [workingHoursStart, setWorkingHoursStart] = useState(user?.profile?.workingHoursStart || '09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState(user?.profile?.workingHoursEnd || '17:00');
  const [preferredStudyTime, setPreferredStudyTime] = useState(user?.profile?.preferredStudyTime || 'evening');
  const [darkMode, setDarkMode] = useState(user?.profile?.darkMode !== false);
  
  const [aiStyle, setAiStyle] = useState<'supportive' | 'tough_love' | 'balanced'>(user?.profile?.aiPreferences?.style || 'supportive');
  const [aiFocus, setAiFocus] = useState<'urgency' | 'importance' | 'balanced'>(user?.profile?.aiPreferences?.priorityFocus || 'balanced');

  const [deadlineWarnings, setDeadlineWarnings] = useState(user?.profile?.notificationPreferences?.deadlineWarnings !== false);
  const [aiInsights, setAiInsights] = useState(user?.profile?.notificationPreferences?.aiInsights !== false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMsg(null);
    setLoading(true);

    const profilePayload = {
      sleepTime,
      wakeTime,
      workingHoursStart,
      workingHoursEnd,
      preferredStudyTime,
      darkMode,
      notificationPreferences: {
        deadlineWarnings,
        aiInsights,
        habitReminders: true
      },
      aiPreferences: {
        style: aiStyle,
        priorityFocus: aiFocus
      }
    };

    try {
      await updateProfile(profilePayload);
      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      
      {/* Header Info */}
      <div className="text-left">
        <span className="text-[10px] font-bold text-primary-blue uppercase tracking-widest block">Account Settings</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">Profile Configurations</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Success / Error Banners */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3 text-sm text-left">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-3 text-sm text-left">
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Split layout modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Col 1: Overview and User Card */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 h-fit">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-blue to-primary-purple flex items-center justify-center text-xl font-black text-white shadow-glow-blue">
                {user?.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-extrabold text-white mt-3 leading-none">{user?.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
            </div>
            
            <div className="border-t border-white/5 pt-4 space-y-3">
              <div className="text-xs font-semibold text-slate-400 flex justify-between">
                <span>Account Status</span>
                <span className="text-primary-blue">Active Pro</span>
              </div>
              <div className="text-xs font-semibold text-slate-400 flex justify-between">
                <span>Total Workload</span>
                <span className="text-white">User Mode</span>
              </div>
            </div>
          </div>

          {/* Col 2 & 3: Configuration Forms */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Working & Energy Hours */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <span className="font-extrabold text-white text-base flex items-center gap-2">
                <Clock size={16} className="text-primary-blue" />
                <span>Working & Energy Cycles</span>
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Wake Time</label>
                  <input
                    type="time"
                    required
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sleep Time</label>
                  <input
                    type="time"
                    required
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Working Hours Start</label>
                  <input
                    type="time"
                    required
                    value={workingHoursStart}
                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Working Hours End</label>
                  <input
                    type="time"
                    required
                    value={workingHoursEnd}
                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Preferred Study Time</label>
                <select
                  value={preferredStudyTime}
                  onChange={(e) => setPreferredStudyTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
                >
                  <option value="morning">Morning Peak (07:00 AM - 12:00 PM)</option>
                  <option value="afternoon">Afternoon Block (12:00 PM - 05:00 PM)</option>
                  <option value="evening">Evening Routine (05:00 PM - 09:00 PM)</option>
                  <option value="night">Night Owl Block (09:00 PM - 02:00 AM)</option>
                </select>
              </div>
            </div>

            {/* AI Preferences */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <span className="font-extrabold text-white text-base flex items-center gap-2">
                <Sparkles size={16} className="text-primary-purple" />
                <span>AI Productivity Assistant Configurations</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">AI Persona Coach Tone</label>
                  <select
                    value={aiStyle}
                    onChange={(e) => setAiStyle(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-purple transition text-sm"
                  >
                    <option value="supportive">Supportive & Empathetic</option>
                    <option value="tough_love">Tough Love (High Accountability)</option>
                    <option value="balanced">Balanced Advisor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">AI Priority Focus</label>
                  <select
                    value={aiFocus}
                    onChange={(e) => setAiFocus(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-purple transition text-sm"
                  >
                    <option value="balanced">Balanced (Default)</option>
                    <option value="urgency">Urgency First (Deadlines)</option>
                    <option value="importance">Impact First (High Priority)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification and Toggle Rules */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <span className="font-extrabold text-white text-base flex items-center gap-2">
                <Settings2 size={16} className="text-slate-400" />
                <span>System Notification Rules</span>
              </span>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-300 block">Proactive Deadline Warnings</span>
                    <p className="text-[10px] text-slate-500">Scan checklist items and trigger alerts if time remaining is critical.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={deadlineWarnings}
                    onChange={(e) => setDeadlineWarnings(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-blue bg-slate-900 border-white/10 focus:ring-primary-blue"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-300 block">AI Suggestions Panel</span>
                    <p className="text-[10px] text-slate-500">Receive motivational tips and schedule restructuring alerts.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiInsights}
                    onChange={(e) => setAiInsights(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-blue bg-slate-900 border-white/10 focus:ring-primary-blue"
                  />
                </div>
              </div>
            </div>

            {/* Form Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 px-4 rounded-xl bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 text-white font-extrabold transition flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-blue text-sm"
            >
              <Save size={16} />
              <span>{loading ? 'Saving Changes...' : 'Save All Settings'}</span>
            </button>

          </div>
        </div>

      </form>
    </div>
  );
};

export default ProfilePage;
