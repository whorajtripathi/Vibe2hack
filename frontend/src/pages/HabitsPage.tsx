import React, { useState } from 'react';
import { useHabits, Habit } from '../context/HabitContext.tsx';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Award,
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const HabitsPage: React.FC = () => {
  const { habits, toggleHabit, createHabit } = useHabits();
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleToggleHabit = async (habitId: string, dateStr: string) => {
    try {
      await toggleHabit(habitId, dateStr);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    setLoading(true);
    try {
      await createHabit(newHabitName.trim());
      setNewHabitName('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate date list for the last 28 days (4 weeks contribution style)
  const getPastDates = (numDays: number) => {
    const dates = [];
    const today = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push({
        dateStr: `${yyyy}-${mm}-${dd}`,
        label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        dayName: d.toLocaleDateString([], { weekday: 'short' })
      });
    }
    return dates;
  };

  const contributionDates = getPastDates(28); // 4 weeks grid
  const todayStr = getTodayDateString();

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <span className="text-[10px] font-bold text-primary-purple uppercase tracking-widest block">Consistency Logs</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Habit Checklist</h2>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Form Box */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 h-fit text-left space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-white">Create Custom Habit</h3>
            <p className="text-slate-400 text-xs mt-1 leading-normal">
              Consistency is key. Define a habit and track your daily streak metrics.
            </p>
          </div>

          <form onSubmit={handleCreateHabit} className="space-y-3">
            <input
              type="text"
              required
              placeholder="e.g. 30 min Cardio"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-purple transition text-xs font-semibold"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-blue to-primary-purple text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow hover:shadow-glow-blue"
            >
              <Plus size={12} />
              <span>{loading ? 'Creating...' : 'Add Habit'}</span>
            </button>
          </form>

          {/* Habit streaks overview banner */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Streaks Highlight</span>
            {habits.length === 0 ? (
              <div className="text-slate-500 text-xs">No habits configured yet.</div>
            ) : (
              habits.slice(0, 3).map((h, i) => (
                <div key={i} className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400 truncate max-w-[150px]">{h.name}</span>
                  <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold">
                    <Flame size={12} className="animate-pulse" />
                    <span>{h.streak}d streak</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Habits checklist and contributions grid */}
        <div className="md:col-span-2 space-y-4">
          {habits.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-500 text-sm rounded-3xl border border-white/5">
              No habits loaded. Add habits using the sidebar to begin tracking.
            </div>
          ) : (
            habits.map(habit => {
              const completedToday = habit.logs.includes(todayStr);
              return (
                <div key={habit._id} className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 text-left">
                  
                  {/* Habit title & details */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-sm text-white leading-tight">{habit.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-1">
                        <span className="flex items-center gap-0.5"><Award size={10} className="text-primary-blue" /> Best: {habit.bestStreak}d</span>
                        <span>•</span>
                        <span>Total logs: {habit.logs.length} completions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Streak badge */}
                      <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold">
                        <Flame size={12} className="animate-pulse" />
                        <span>{habit.streak}d</span>
                      </div>

                      {/* Daily Completion Checkbox */}
                      <button
                        onClick={() => handleToggleHabit(habit._id, todayStr)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                          completedToday 
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                            : 'bg-white/5 border-white/10 hover:border-emerald-500 hover:text-emerald-400 text-slate-300'
                        }`}
                      >
                        <CheckCircle size={12} />
                        <span>{completedToday ? 'Done Today' : 'Mark Done'}</span>
                      </button>
                    </div>
                  </div>

                  {/* GitHub contribution graph mockup */}
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                      Past 28 Days Completion Grid
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
                      {contributionDates.map((item, idx) => {
                        const isDone = habit.logs.includes(item.dateStr);
                        const isDayToday = item.dateStr === todayStr;
                        
                        let cellBg = 'bg-slate-900 border-white/5';
                        if (isDone) cellBg = 'bg-gradient-to-tr from-primary-blue to-primary-purple border-primary-blue/30 shadow-glow-blue';
                        else if (isDayToday) cellBg = 'bg-slate-800 border-white/10 ring-1 ring-white/10';

                        return (
                          <button
                            key={idx}
                            onClick={() => handleToggleHabit(habit._id, item.dateStr)}
                            className={`w-[18px] h-[18px] md:w-5 md:h-5 rounded-md border shrink-0 hover:scale-110 transition-transform ${cellBg}`}
                            title={`${item.label} (${isDone ? 'Completed' : 'Missed'})`}
                          />
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};

export default HabitsPage;
