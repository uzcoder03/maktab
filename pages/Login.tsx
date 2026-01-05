
import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Lock, User as UserIcon, ArrowRight, ServerCrash, Cpu, Activity, Zap } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.message || 'Kirish rad etildi! Protokol xatosi.');
      }
    } catch (err) {
      setError('Server xatosi: Tizimga ulanib bo\'lmadi. Firewall yoki Backend ishlamayapti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Digital Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ 
             backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }}>
      </div>
      
      {/* Moving Scanning Line */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
        <div className="w-full h-[2px] bg-cyan-500 shadow-[0_0_15px_#06b6d4] animate-[scan_4s_linear_infinite]"></div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-lg relative z-10">
        {/* Branding Header */}
        <div className="text-center mb-10 space-y-3 animate-in fade-in zoom-in duration-700">
          <div className="inline-flex items-center justify-center p-5 bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.1)] mb-4 relative group">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <ShieldCheck size={52} className="relative z-10" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
               <Cpu size={14} className="text-cyan-500 animate-pulse" />
               <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Hackathon IT School</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              TARMOQ <span className="text-cyan-400">XAVFSIZLIGI</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Boshqaruv va Monitoring Markazi</p>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-slate-800 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500 rounded-br-lg"></div>

          <form onSubmit={handleLogin} className="space-y-8 relative z-10">
            {error && (
              <div className="bg-rose-500/10 text-rose-400 px-5 py-4 rounded-2xl text-xs font-black border border-rose-500/20 flex items-center gap-3 animate-bounce">
                <ServerCrash size={18} className="shrink-0" />
                <span className="uppercase tracking-wider">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identifikator</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <UserIcon className="text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" size={20} />
                </div>
                <input 
                  required
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl pl-14 pr-6 py-5 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Maxfiy Kod</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" size={20} />
                </div>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl pl-14 pr-6 py-5 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group/btn overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-indigo-600 group-hover/btn:scale-105 transition-transform duration-500"></div>
              <div className="relative flex items-center justify-center gap-3 py-5 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] uppercase tracking-widest text-xs">
                {loading ? (
                  <Activity size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>AUTORIZATSIYA</span>
                    <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                  </>
                )}
              </div>
            </button>
            
            <div className="flex items-center justify-center gap-4 text-slate-600 text-[10px] font-bold uppercase tracking-widest pt-4">
               <div className="flex items-center gap-1">
                 <Zap size={10} className="text-cyan-500" />
                 <span>Encrypted Session</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-slate-800"></div>
               <div className="flex items-center gap-1">
                 <ShieldCheck size={10} className="text-indigo-500" />
                 <span>Secure Access</span>
               </div>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
          Tizim faqat vakolatli xodimlar uchun. Barcha harakatlar loglanadi.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}} />
    </div>
  );
};

export default Login;
