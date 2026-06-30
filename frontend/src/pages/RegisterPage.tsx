import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    
    setFormError(null);
    clearError();
    setLoading(true);
    
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute w-[350px] height-[350px] bg-primary-blue/10 rounded-full filter blur-[80px] top-1/4 left-1/4 animate-pulse-slow"></div>
      <div className="absolute w-[350px] height-[350px] bg-primary-purple/10 rounded-full filter blur-[80px] bottom-1/4 right-1/4 animate-pulse-slow"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Banner */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-blue to-primary-purple flex items-center justify-center shadow-glow-blue mb-3">
            <Sparkles size={22} className="text-white animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 mt-1 text-sm text-center">Join LastMinute Hero and reclaim your schedule</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Display errors */}
            {(formError || error) && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-start gap-3 text-sm">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-400" />
                <span>{formError || error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-6 rounded-xl bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-blue"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <span className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-blue hover:underline font-semibold">
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
