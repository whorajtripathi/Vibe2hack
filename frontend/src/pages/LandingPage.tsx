import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Calendar, 
  Timer, 
  LineChart, 
  CheckCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does the AI Deadline Risk Predictor work?",
      a: "Our Risk Predictor calculates the estimated time left before your deadline, factors in your active overlapping tasks and sleep times, and highlights whether you have enough buffer hours. Gemini then recommends whether you should start working immediately or reschedule lower-value tasks."
    },
    {
      q: "Can I use my own Gemini API Key?",
      a: "Yes. By default, the application runs on a local smart mock fallback. You can connect it to your own Google Gemini API Key in the settings (configured via a .env file) to unlock real-time intelligence tailored specifically for your work."
    },
    {
      q: "What makes LastMinute Hero different from traditional Todo apps?",
      a: "Traditional todo apps just send you a push notification when it's too late. LastMinute Hero analyzes your cognitive capacity, constructs a step-by-step hourly timeline for your entire day, and actively coaches you to complete the work."
    },
    {
      q: "Is there a mobile version of the dashboard?",
      a: "Yes! LastMinute Hero is designed with a fully responsive mobile layout. The schedule timeline, habit contribution grid, and focus mode timer adapt perfectly to any smartphone size."
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden select-none">
      {/* Decorative Gradient Spheres */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-primary-blue/20 to-primary-purple/10 filter blur-[120px] top-[-200px] left-[-100px] pointer-events-none"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-primary-purple/20 to-primary-blue/10 filter blur-[120px] bottom-[-200px] right-[-100px] pointer-events-none"></div>

      {/* Header Navigation */}
      <nav className="w-full h-20 px-6 md:px-12 flex items-center justify-between border-b border-white/5 relative z-20 backdrop-blur-md bg-[#030712]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-blue to-primary-purple flex items-center justify-center shadow-glow-blue">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">LastMinute Hero</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition">
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-blue to-primary-purple text-white text-sm font-bold shadow-lg hover:shadow-glow-blue hover:brightness-110 transition"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-white/10 text-xs font-semibold text-primary-purple mb-8 shadow-sm">
          <Sparkles size={12} className="animate-pulse" />
          <span>Gemini AI-Powered Productivity Companion</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-none">
          Don't remind me.<br />
          <span className="text-gradient-primary">Help me finish.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 mt-6 text-lg md:text-xl font-medium leading-relaxed">
          The ultimate productivity companion that proactively schedules your work, predicts deadline risks, and coaches you through focus sessions.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-blue to-primary-purple text-white font-extrabold flex items-center justify-center gap-2 shadow-2xl hover:shadow-glow-blue hover:brightness-110 transition"
          >
            <span>Start Planning Smarter</span>
            <ArrowRight size={18} />
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 hover:text-white font-bold transition"
          >
            Explore Features
          </a>
        </div>

        {/* Hero Interactive App Mockup */}
        <div className="mt-16 relative rounded-3xl overflow-hidden glass-panel border border-white/15 p-4 max-w-4xl mx-auto shadow-2xl animate-float">
          <div className="rounded-2xl overflow-hidden bg-slate-950 border border-white/5 aspect-video flex flex-col">
            {/* Window bar */}
            <div className="h-8 bg-slate-900 flex items-center gap-1.5 px-4 border-b border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/50"></span>
              <span className="text-[10px] text-slate-500 ml-4 font-semibold">lastminute-hero.app/dashboard</span>
            </div>
            
            {/* Inside mockup */}
            <div className="flex-1 p-6 grid grid-cols-3 gap-4 text-left">
              {/* Col 1 */}
              <div className="col-span-2 space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 border border-primary-blue/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-200">Today's Focus Task</span>
                    <span className="px-2 py-0.5 text-[9px] rounded bg-red-500/20 text-red-400 font-extrabold">HIGH RISK</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">Design Pitch & System Architecture</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Requires 3 hours focus, deadline in 4 hours. No time to waste!</p>
                </div>
                
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
                  <span className="text-xs font-bold text-slate-400 block mb-3">AI Plan Timeline</span>
                  <div className="space-y-2.5">
                    {[
                      { time: "09:00 AM", task: "Review requirements", status: "done" },
                      { time: "11:00 AM", task: "Architecture Pitch (Focus task)", status: "pending" },
                      { time: "02:00 PM", task: "Lunch & Recharge", status: "pending" }
                    ].map((s, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <span className="text-[10px] text-slate-500 font-semibold w-16">{s.time}</span>
                        <div className={`w-2 h-2 rounded-full ${s.status === 'done' ? 'bg-primary-blue' : 'bg-slate-700'}`}></div>
                        <span className={s.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-300 font-semibold'}>{s.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Col 2 */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-bold text-slate-400">Streak Score</span>
                    <p className="text-3xl font-extrabold text-white mt-1">87%</p>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mt-4">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <span key={i} className={`w-3.5 h-3.5 rounded-sm ${i % 3 === 0 ? 'bg-primary-blue/30' : i % 5 === 0 ? 'bg-slate-800' : 'bg-gradient-to-tr from-primary-blue to-primary-purple'}`}></span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Stop reacting. Start executing.
          </h2>
          <p className="text-slate-400 mt-4 font-medium">
            Everything you need to defeat analysis paralysis and hit deadlines consistently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "AI Daily Plan Generator",
              desc: "Gemini takes all your tasks, analyzes constraints, and compiles an optimized schedule mapped out hourly so you know exactly what to work on next.",
              icon: Sparkles,
              color: "text-primary-blue"
            },
            {
              title: "Deadline Risk Predictor",
              desc: "Proactively forecasts bottleneck days, showing high-risk tasks when overlapping time estimates clash or deadline buffers become dangerously thin.",
              icon: ShieldAlert,
              color: "text-red-400"
            },
            {
              title: "Smart Schedule & Calendar",
              desc: "A stunning interactive monthly and timeline view representing task clusters, upcoming deadlines, and customized rest buffers.",
              icon: Calendar,
              color: "text-primary-purple"
            },
            {
              title: "Immersive Focus Mode",
              desc: "Block out the noise with our customizable Pomodoro focus session. Includes progress visualizer, dynamic coaching advice, and success triggers.",
              icon: Timer,
              color: "text-emerald-400"
            }
          ].map((feat, index) => (
            <div key={index} className="glass-panel p-8 rounded-3xl border border-white/5 relative group hover:border-white/10 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${feat.color}`}>
                <feat.icon size={20} />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Flexible Pricing Plans</h2>
          <p className="text-slate-400 mt-2 font-medium">Get the planning system that works for your schedule.</p>
          
          {/* Toggle billing */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 mt-6">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${billingCycle === 'monthly' ? 'bg-primary-blue text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${billingCycle === 'yearly' ? 'bg-primary-blue text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Card */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Basic Plan</span>
              <h3 className="text-2xl font-bold text-white">Hero Free</h3>
              <p className="text-slate-400 text-sm mt-3">All core schedule planner features with simulated local AI suggestions.</p>
              
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-slate-500 text-sm ml-2">/ month</span>
              </div>

              <ul className="mt-8 space-y-3.5 text-sm text-slate-300">
                {["Unlimited tasks listing", "Smart mock AI plan generator", "Interactive focus timer", "Simple calendar display"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle size={14} className="text-primary-blue shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Link 
              to="/register" 
              className="mt-8 w-full py-3.5 px-4 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-white font-bold transition text-center text-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Card */}
          <div className="glass-panel p-8 rounded-3xl border border-primary-blue/30 relative flex flex-col justify-between shadow-glow-blue bg-gradient-to-b from-slate-900/60 to-slate-950/40">
            <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-primary-blue/10 border border-primary-blue/20 text-[10px] font-bold text-primary-blue uppercase tracking-wider">
              Most Popular
            </span>
            
            <div>
              <span className="text-xs font-bold text-primary-purple uppercase tracking-widest block mb-2">Professional</span>
              <h3 className="text-2xl font-bold text-white">Hero Pro</h3>
              <p className="text-slate-400 text-sm mt-3">Connect your own Gemini key for active schedule modeling.</p>
              
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-black text-white">
                  {billingCycle === 'monthly' ? '$8' : '$6.40'}
                </span>
                <span className="text-slate-500 text-sm ml-2">/ month</span>
              </div>

              <ul className="mt-8 space-y-3.5 text-sm text-slate-300">
                {["Everything in Free", "Google Gemini Live integration", "Holistic multi-task conflicts checking", "Premium habits contributions graph", "Actionable motivation custom logs"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle size={14} className="text-primary-purple shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Link 
              to="/register" 
              className="mt-8 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-blue to-primary-purple text-white font-bold transition text-center text-sm shadow shadow-glow-blue hover:brightness-110"
            >
              Plan with Pro
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2.5">
            <HelpCircle size={24} className="text-primary-blue" />
            <span>Frequently Asked Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-2xl overflow-hidden border border-white/5">
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 flex items-center justify-between text-left font-bold text-white hover:bg-white/[0.02]"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180 text-white' : ''}`} 
                />
              </button>
              {activeFaq === idx && (
                <div className="p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/5 bg-slate-900/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative z-10 w-full py-12 px-6 border-t border-white/5 bg-[#030712]/80 text-slate-500 text-center text-xs">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary-blue to-primary-purple flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">LM</span>
            </div>
            <span className="font-bold text-white">LastMinute Hero</span>
          </div>
          <p>© 2026 LastMinute Hero. Built with Google Gemini. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
