import React, { useState } from 'react';
import { useTasks, Task } from '../context/TaskContext.tsx';
import TaskModal from '../components/TaskModal.tsx';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const CalendarPage: React.FC = () => {
  const { tasks } = useTasks();
  
  // Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Grid array construction
  const calendarDays = [];
  
  // Padding for previous month days
  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonthDaysCount - i),
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      date: new Date(year, month, d),
      isCurrentMonth: true
    });
  }

  // Padding for next month days to make it multiples of 7 (6 rows of 7 = 42)
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    calendarDays.push({
      date: new Date(year, month + 1, d),
      isCurrentMonth: false
    });
  }

  // Format month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to compare dates ignoring time
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Fetch tasks matching cell date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(t => isSameDay(new Date(t.deadline), date));
  };

  // List of tasks due on the SELECTED date
  const selectedDateTasks = getTasksForDate(selectedDate);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <span className="text-[10px] font-bold text-primary-purple uppercase tracking-widest block">Scheduling</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Smart Schedule</h2>
        </div>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-blue to-primary-purple text-white text-xs font-bold transition flex items-center gap-2 hover:brightness-110 shadow hover:shadow-glow-blue"
        >
          <Plus size={14} />
          <span>New Task</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid Box */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-white/5 flex flex-col">
          
          {/* Calendar Header Navigator */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-white">
              {monthNames[month]} {year}
            </h3>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
                className="px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 text-xs font-bold"
              >
                Today
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map(day => (
              <span key={day} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{day}</span>
            ))}
          </div>

          {/* Cells mapping */}
          <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[300px]">
            {calendarDays.map((cell, idx) => {
              const cellTasks = getTasksForDate(cell.date);
              const cellPending = cellTasks.filter(t => t.status !== 'completed');
              const isSelected = isSameDay(cell.date, selectedDate);
              const isToday = isSameDay(cell.date, new Date());
              
              // Determine cell accent colors based on pending task load (urgency/danger)
              let borderAccent = 'border-transparent';
              if (isSelected) borderAccent = 'border-primary-blue';
              else if (isToday) borderAccent = 'border-white/20';

              let bgAccent = 'bg-slate-900/20';
              if (isSelected) bgAccent = 'bg-primary-blue/10';
              else if (!cell.isCurrentMonth) bgAccent = 'bg-slate-950/10 opacity-30';

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`p-2 rounded-xl border ${borderAccent} ${bgAccent} hover:bg-white/[0.04] transition flex flex-col justify-between items-start text-left min-h-[60px] md:min-h-[75px] group`}
                >
                  <span className={`text-xs font-bold ${
                    isToday ? 'text-primary-blue' : cell.isCurrentMonth ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {cell.date.getDate()}
                  </span>
                  
                  {/* Indicators (dots representing priority task items) */}
                  {cellPending.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cellPending.slice(0, 3).map((t) => (
                        <span 
                          key={t._id} 
                          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" 
                          style={{ backgroundColor: t.colorLabel }}
                          title={t.title}
                        />
                      ))}
                      {cellPending.length > 3 && (
                        <span className="text-[8px] font-black text-slate-500">+{cellPending.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Selected Date Detail List (Right Panel) */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="border-b border-white/5 pb-4 mb-4 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Date</span>
              <h3 className="font-extrabold text-base text-white mt-1">
                {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
            </div>

            {/* Task log container */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {selectedDateTasks.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center">
                  <CalendarIcon size={28} className="text-slate-600 mb-2" />
                  <p>No tasks due on this date.</p>
                </div>
              ) : (
                selectedDateTasks.map(t => (
                  <div key={t._id} className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 text-left space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">{t.title}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 ${
                        t.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-white/5">
                      <span className="flex items-center gap-0.5"><Clock size={9} /> {t.estimatedTime}h est</span>
                      <span className="capitalize">{t.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 mt-6"
          >
            <Plus size={12} />
            <span>Add Task to this Date</span>
          </button>
        </div>

      </div>

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

    </div>
  );
};

export default CalendarPage;
