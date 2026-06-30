import React, { useState, useEffect } from 'react';
import { useTasks, Task } from '../context/TaskContext.tsx';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { createTask, updateTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Study');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [estimatedTime, setEstimatedTime] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [colorLabel, setColorLabel] = useState('#3b82f6');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setDifficulty(taskToEdit.difficulty);
      setEstimatedTime(taskToEdit.estimatedTime);
      // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
      const d = new Date(taskToEdit.deadline);
      const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
      setDeadline(localISOTime);
      setColorLabel(taskToEdit.colorLabel);
      setRecurring(taskToEdit.recurring);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Study');
      setPriority('medium');
      setDifficulty('medium');
      setEstimatedTime(1);
      // Default deadline to tomorrow same time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDeadline(tomorrow.toISOString().slice(0, 16));
      setColorLabel('#3b82f6');
      setRecurring('none');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !estimatedTime || !deadline) return;

    setLoading(true);
    const taskData = {
      title,
      description,
      category,
      priority,
      difficulty,
      estimatedTime: Number(estimatedTime),
      deadline: new Date(deadline).toISOString(),
      status: taskToEdit ? taskToEdit.status : 'pending' as any,
      colorLabel,
      recurring
    };

    try {
      if (taskToEdit) {
        await updateTask(taskToEdit._id, taskData);
      } else {
        await createTask(taskData);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Green', value: '#10b981' },
    { label: 'Yellow', value: '#f59e0b' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Pink', value: '#ec4899' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Box */}
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-white/10 p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {taskToEdit ? 'Edit Focus Task' : 'Add New Focus Task'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Design Architecture Pitch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-blue transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea
              placeholder="Add details, links, or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-blue transition text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
              >
                {['Study', 'Work', 'Personal', 'Health', 'Finance', 'General'].map(c => (
                  <option key={c} value={c} className="bg-slate-900">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recurring</label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
              >
                <option value="none" className="bg-slate-900">None</option>
                <option value="daily" className="bg-slate-900">Daily</option>
                <option value="weekly" className="bg-slate-900">Weekly</option>
                <option value="monthly" className="bg-slate-900">Monthly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
              >
                <option value="low" className="bg-slate-900">Low</option>
                <option value="medium" className="bg-slate-900">Medium</option>
                <option value="high" className="bg-slate-900">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
              >
                <option value="easy" className="bg-slate-900">Easy</option>
                <option value="medium" className="bg-slate-900">Medium</option>
                <option value="hard" className="bg-slate-900">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Est. Hours</label>
              <input
                type="number"
                required
                min={0.1}
                step={0.1}
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Deadline Date & Time</label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-primary-blue transition text-sm"
            />
          </div>

          {/* Color Labels */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Color Label</label>
            <div className="flex gap-3">
              {colors.map(c => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColorLabel(c.value)}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    colorLabel === c.value ? 'scale-125 border-white ring-2 ring-primary-blue/30' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 text-white font-bold transition text-sm shadow hover:shadow-glow-blue"
            >
              {loading ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
