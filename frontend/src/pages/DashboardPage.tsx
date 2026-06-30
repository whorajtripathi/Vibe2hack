import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useTasks, Task } from '../context/TaskContext.tsx';
import { useHabits } from '../context/HabitContext.tsx';
import TaskModal from '../components/TaskModal.tsx';
import { 
  Sparkles, 
  Plus, 
  Timer, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  Search,
  CheckCircle,
  Clock,
  Archive,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, aiPlan, generatingAIPlan, generatePlan, toggleComplete, deleteTask, updateTask } = useTasks();
  const { habits, toggleHabit } = useHabits();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  // Modal State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);

  // Greeting helper
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await toggleComplete(task._id);
      
      // Trigger confetti if task was pending and is now completed, and priority is high
      if (task.status !== 'completed') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#10b981']
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  const handleCreateTaskClick = () => {
    setTaskToEdit(undefined);
    setTaskModalOpen(true);
  };

  const handleGenerateAIPlan = async () => {
    try {
      await generatePlan();
    } catch (err) {
      console.error('Failed to generate AI plan:', err);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (taskFilter === 'all') return matchesSearch;
    if (taskFilter === 'completed') return t.status === 'completed' && matchesSearch;
    return t.status !== 'completed' && t.status !== 'archived' && matchesSearch;
  });

  // Calculate Productivity Score (Percentage of tasks completed)
  const activeAndCompletedTasks = tasks.filter(t => t.status !== 'archived');
  const completedTasksCount = activeAndCompletedTasks.filter(t => t.status === 'completed').length;
  const totalTasksCount = activeAndCompletedTasks.length;
  const productivityScore = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Find Today's Focus task (Highest priority active task)
  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived');
  const focusTask = activeTasks.find(t => t.priority === 'high') || activeTasks[0];

  // Formatting habits dates for toggling
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleToggleHabit = async (habitId: string) => {
    const todayStr = getTodayDateString();
    try {
      await toggleHabit(habitId, todayStr);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-none">
            {getGreeting()}, {user?.name.split(' ')[0]}!
          </h2>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">
            Here's what your day looks like.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleCreateTaskClick}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 text-white text-xs font-bold transition flex items-center gap-2"
          >
            <Plus size={14} />
            <span>Add Focus Task</span>
          </button>
          
          <button 
            onClick={() => navigate('/focus')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 text-white text-xs font-bold transition flex items-center gap-2"
          >
            <Timer size={14} className="text-primary-blue" />
            <span>Focus Session</span>
          </button>

          <button 
            onClick={handleGenerateAIPlan}
            disabled={generatingAIPlan}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 disabled:opacity-50 text-white text-xs font-extrabold transition flex items-center gap-2 shadow hover:shadow-glow-blue"
          >
            <Sparkles size={14} className={generatingAIPlan ? "animate-spin text-white" : "text-white"} />
            <span>{generatingAIPlan ? 'Generating...' : 'Generate AI Plan'}</span>
          </button>
        </div>
      </div>

      {/* Grid Dashboard Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Focus & Metrics) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Top row of stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Focus Task Card */}
            <div className="glass-panel p-5 rounded-3xl flex flex-col justify-between border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-blue/5 rounded-full filter blur-xl"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-primary-blue uppercase tracking-widest">Today's Focus</span>
                  {focusTask?.priority === 'high' && (
                    <span className="px-2 py-0.5 text-[9px] rounded bg-red-500/10 text-red-400 font-extrabold border border-red-500/15">CRITICAL</span>
                  )}
                </div>
                {focusTask ? (
                  <>
                    <h3 className="font-bold text-white text-base leading-snug">{focusTask.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 truncate">{focusTask.description || 'No description provided.'}</p>
                    <div className="flex items-center gap-3 mt-4 text-[10px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><Clock size={10} /> {focusTask.estimatedTime}h Est</span>
                      <span>•</span>
                      <span>Due {new Date(focusTask.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-slate-500 text-xs font-semibold">
                    No active tasks today. Plan ahead!
                  </div>
                )}
              </div>

              {focusTask && (
                <button 
                  onClick={() => navigate('/focus')}
                  className="mt-5 w-full py-2.5 rounded-xl bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Play size={10} fill="currentColor" />
                  <span>Start Focus Session</span>
                </button>
              )}
            </div>

            {/* Productivity score card */}
            <div className="glass-panel p-5 rounded-3xl flex items-center justify-between border border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Productivity Score</span>
                <p className="text-3xl font-extrabold text-white mt-1">{productivityScore}%</p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {completedTasksCount} of {totalTasksCount} tasks complete today.
                </p>
              </div>

              {/* Dial widget */}
              <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="26" 
                    className="text-primary-blue transition-all duration-500" 
                    strokeWidth="6" 
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={2 * Math.PI * 26 * (1 - productivityScore / 100)}
                    strokeLinecap="round"
                    stroke="currentColor" 
                    fill="transparent" 
                  />
                </svg>
                <div className="absolute text-[11px] font-extrabold text-white">{productivityScore}%</div>
              </div>
            </div>

          </div>

          {/* Recent Tasks List */}
          <div className="glass-panel rounded-3xl p-5 border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <span className="font-bold text-white text-base">Your Task Inventory</span>
              
              {/* Task filters & search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="pl-8 pr-3 py-1 text-xs rounded-lg bg-slate-900 border border-white/5 text-white placeholder-slate-500 focus:outline-none w-32 md:w-40"
                  />
                </div>

                <div className="flex p-0.5 rounded-lg bg-slate-900 border border-white/5 text-[10px] font-bold">
                  {(['pending', 'completed', 'all'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`px-2 py-1 rounded transition capitalize ${taskFilter === f ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks render */}
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {filteredTasks.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  {searchQuery ? 'No tasks matches search query.' : 'Task inventory is empty. Add a task to begin!'}
                </div>
              ) : (
                filteredTasks.map(t => {
                  const isDone = t.status === 'completed';
                  return (
                    <div 
                      key={t._id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isDone 
                          ? 'bg-slate-950/20 border-white/5 text-slate-500' 
                          : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <button 
                          onClick={() => handleToggleComplete(t)}
                          className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
                            isDone 
                              ? 'bg-primary-blue/10 border-primary-blue text-primary-blue' 
                              : 'border-white/20 hover:border-primary-blue'
                          }`}
                        >
                          {isDone && <CheckCircle size={12} fill="currentColor" className="text-white" />}
                        </button>
                        
                        <div className="overflow-hidden">
                          <h4 className={`font-semibold text-xs text-left truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {t.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[9px] text-slate-500 mt-1">
                            <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: `${t.colorLabel}15`, color: t.colorLabel }}>
                              {t.category}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><Clock size={9} /> {t.estimatedTime}h</span>
                            <span>•</span>
                            <span className={t.priority === 'high' ? 'text-red-400 font-bold' : ''}>
                              {t.priority.toUpperCase()} Priority
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={() => handleEditTask(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                          title="Edit Task"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button 
                          onClick={() => deleteTask(t._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition"
                          title="Delete Task"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (AI suggestions and habit checkpoints) */}
        <div className="space-y-6">
          
          {/* AI Plan Panel */}
          <div className="glass-panel rounded-3xl p-5 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-purple/5 rounded-full filter blur-xl"></div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles size={16} className="text-primary-purple animate-pulse" />
                <span>Today's AI Plan</span>
              </span>
              {aiPlan && (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Updated Today
                </span>
              )}
            </div>

            {aiPlan ? (
              <div className="space-y-4">
                
                {/* Motivation Box */}
                {aiPlan.motivation && (
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-left italic text-slate-300 leading-normal">
                    "{aiPlan.motivation}"
                  </div>
                )}

                {/* Warnings List */}
                {aiPlan.warnings && aiPlan.warnings.length > 0 && (
                  <div className="space-y-2">
                    {aiPlan.warnings.slice(0, 2).map((w, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/15 flex items-start gap-2 text-[10px] text-red-200">
                        <AlertTriangle size={13} className="shrink-0 text-red-400 mt-0.5" />
                        <span className="text-left font-medium">{w.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Schedule timeline block preview */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left block">Planned Timeline</span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {aiPlan.todaySchedule.map((block, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs text-left">
                        <span className="text-[10px] text-slate-500 font-bold w-14 shrink-0">{block.time}</span>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          block.type === 'work' ? 'bg-primary-blue shadow-glow-blue' :
                          block.type === 'sleep' ? 'bg-slate-700' : 'bg-primary-purple'
                        }`}></div>
                        <span className="text-slate-300 font-medium truncate">{block.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                <p className="text-xs max-w-[200px] leading-relaxed">
                  No AI productivity plan generated for today yet.
                </p>
                <button 
                  onClick={handleGenerateAIPlan}
                  disabled={generatingAIPlan}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary-blue/15 hover:bg-primary-blue/25 text-primary-blue text-xs font-bold transition flex items-center gap-1.5 border border-primary-blue/10"
                >
                  <Sparkles size={11} className={generatingAIPlan ? "animate-spin" : ""} />
                  <span>{generatingAIPlan ? 'Analyzing...' : 'Generate Plan'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Habit Tracker */}
          <div className="glass-panel rounded-3xl p-5 border border-white/5">
            <span className="font-bold text-white text-base block mb-3 text-left">Today's Habits</span>
            <div className="space-y-2 text-left">
              {habits.slice(0, 4).map(habit => {
                const todayStr = getTodayDateString();
                const isCompletedToday = habit.logs.includes(todayStr);
                return (
                  <div 
                    key={habit._id} 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <button 
                        onClick={() => handleToggleHabit(habit._id)}
                        className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ${
                          isCompletedToday 
                            ? 'bg-primary-purple border-primary-purple text-white shadow' 
                            : 'border-white/20 hover:border-primary-purple'
                        }`}
                      >
                        {isCompletedToday && <CheckCircle size={10} fill="currentColor" className="text-white" />}
                      </button>
                      <span className={`text-xs font-medium truncate ${isCompletedToday ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                        {habit.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold shrink-0">
                      <Flame size={11} className={habit.streak > 0 ? "text-orange-500 animate-pulse" : "text-slate-600"} />
                      <span>{habit.streak}d streak</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => navigate('/habits')}
              className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Manage Habits</span>
              <ArrowRight size={10} />
            </button>
          </div>

        </div>

      </div>

      {/* Task Modal Trigger overlay */}
      <TaskModal 
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskToEdit={taskToEdit}
      />

    </div>
  );
};

export default DashboardPage;
