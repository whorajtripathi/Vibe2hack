import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    
    setFormError(null);
    clearError();
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Error handled by context or thrown
      setFormError(err.message || 'Invalid credentials.');
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-blue to-primary-purple flex items-center justify-center shadow-glow-blue mb-3">
            <Sparkles size={22} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 mt-2 text-sm text-center">"Don't remind me. Help me finish."</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Display errors */}
            {(formError || error) && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-start gap-3 text-sm">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-400" />
                <span>{formError || error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Demo forgot password: type any email/password to sign up, or test default login credentials.')}
                  className="text-xs text-primary-blue hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-blue"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <span className="text-sm text-slate-400">
              New to LastMinute Hero?{' '}
              <Link to="/register" className="text-primary-purple hover:underline font-semibold">
                Create an Account
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
