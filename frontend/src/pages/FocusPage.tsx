import React, { useState, useEffect, useRef } from 'react';
import { useTasks, Task } from '../context/TaskContext.tsx';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Volume2, 
  VolumeX, 
  Coffee,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

const FocusPage: React.FC = () => {
  const { tasks, toggleComplete } = useTasks();
  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived');

  // Focus Task State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Timer Configuration
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [focusTime, setFocusTime] = useState(25); // in minutes
  const [breakTime, setBreakTime] = useState(5); // in minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Ref to track interval
  const timerRef = useRef<any>(null);

  // Sync state with selected task or initial task load
  useEffect(() => {
    if (activeTasks.length > 0 && !selectedTask) {
      // Pick highest priority task first
      const high = activeTasks.find(t => t.priority === 'high');
      setSelectedTask(high || activeTasks[0]);
    }
  }, [tasks]);

  // Handle timer ticker
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  // Handle mode transitions
  const resetTimer = () => {
    setIsRunning(false);
    const duration = mode === 'focus' ? focusTime : breakTime;
    setTimeLeft(duration * 60);
  };

  useEffect(() => {
    resetTimer();
  }, [mode, focusTime, breakTime]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play alert sound if not muted
    if (!isMuted) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    }

    // Trigger confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Alert completion
    alert(mode === 'focus' ? 'Focus session completed! Time for a short break.' : 'Break completed! Ready to focus?');
    setMode(prev => prev === 'focus' ? 'break' : 'focus');
  };

  const handleCompleteFocusTask = async () => {
    if (!selectedTask) return;
    try {
      await toggleComplete(selectedTask._id);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Select another task
      const nextTask = activeTasks.find(t => t._id !== selectedTask._id);
      setSelectedTask(nextTask || null);
      
      alert('Focus Task marked as completed! Outstanding job.');
    } catch (err) {
      console.error(err);
    }
  };

  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress Bar percentage
  const totalSeconds = (mode === 'focus' ? focusTime : breakTime) * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Curated motivational quotes
  const quotes = [
    "Focus is a muscle, and you are building it right now.",
    "One block at a time. Small steps build giant results.",
    "Deep work is the superpower of the 21st century.",
    "Don't look at the clock; do what it does. Keep going.",
    "Your future self will thank you for focusing today.",
    "Discipline is choosing between what you want now and what you want most."
  ];
  
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    if (timeLeft % 300 === 0 && timeLeft !== totalSeconds) { // change quote every 5 mins
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }
  }, [timeLeft]);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto min-h-[85vh] flex flex-col justify-center">
      
      {/* Immersive Focus Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-bold text-primary-blue uppercase tracking-widest block">Focus Session</span>
        <h2 className="text-3xl font-extrabold text-white">Immersive Focus Mode</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto font-medium">
          Ditch the noise. Choose your target task and let the clock guide you.
        </p>
      </div>

      {/* Target Task Select */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 max-w-xl mx-auto w-full">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-left">
            Active Target Goal
          </label>
          <select
            value={selectedTask?._id || ''}
            onChange={(e) => {
              const task = activeTasks.find(t => t._id === e.target.value);
              setSelectedTask(task || null);
            }}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white font-medium focus:outline-none focus:border-primary-blue transition text-sm"
          >
            {activeTasks.length === 0 ? (
              <option value="">No active tasks available</option>
            ) : (
              activeTasks.map(t => (
                <option key={t._id} value={t._id}>
                  {t.title} ({t.priority.toUpperCase()} priority • ~{t.estimatedTime}h)
                </option>
              ))
            )}
          </select>
        </div>

        {selectedTask && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/5">
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-500 block">DESCRIPTION</span>
              <p className="text-xs text-slate-300 mt-1 leading-normal">
                {selectedTask.description || 'No description provided.'}
              </p>
            </div>
            
            <button 
              onClick={handleCompleteFocusTask}
              className="px-4 py-2.5 rounded-xl bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 border border-primary-blue/15"
            >
              <CheckCircle size={13} />
              <span>Mark Complete</span>
            </button>
          </div>
        )}
      </div>

      {/* Timer Dial Display */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center max-w-xl mx-auto w-full relative overflow-hidden flex flex-col items-center">
        
        {/* Glow overlay */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full filter blur-[60px] opacity-10 transition-all ${
          mode === 'focus' ? 'bg-primary-blue' : 'bg-primary-purple'
        }`}></div>

        {/* Timer Modes toggler */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/5 mb-6 relative z-10">
          <button 
            onClick={() => setMode('focus')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${mode === 'focus' ? 'bg-primary-blue text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Timer size={13} />
            <span>Focus Session</span>
          </button>
          <button 
            onClick={() => setMode('break')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${mode === 'break' ? 'bg-primary-purple text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Coffee size={13} />
            <span>Short Break</span>
          </button>
        </div>

        {/* Big Digit display */}
        <div className="relative z-10 space-y-1 my-4">
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight leading-none tabular-nums font-mono">
            {formatTime(timeLeft)}
          </h1>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {mode === 'focus' ? 'Deep Focus block' : 'Short Break buffer'}
          </span>
        </div>

        {/* Time Progress bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden my-6 relative z-10 border border-white/5">
          <div 
            className={`h-full transition-all duration-300 ${
              mode === 'focus' ? 'bg-gradient-to-r from-primary-blue to-primary-violet' : 'bg-primary-purple'
            }`} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Timer controller actions */}
        <div className="flex items-center gap-4 relative z-10">
          {/* Sound Toggle */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
            title={isMuted ? "Unmute Timer Alert" : "Mute Timer Alert"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Start/Pause */}
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition ${
              isRunning 
                ? 'bg-slate-800 text-white hover:bg-slate-700' 
                : 'bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 text-white shadow-glow-blue'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={16} fill="currentColor" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Start Session</span>
              </>
            )}
          </button>

          {/* Reset */}
          <button 
            onClick={resetTimer}
            className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
            title="Reset timer block"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Motivational Quotes */}
        <div className="mt-8 pt-6 border-t border-white/5 w-full relative z-10">
          <p className="text-xs italic text-slate-400 leading-normal max-w-sm mx-auto">
            "{quotes[quoteIndex]}"
          </p>
        </div>

      </div>

    </div>
  );
};

export default FocusPage;
