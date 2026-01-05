
import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Lock, 
  User, 
  Monitor, 
  Check, 
  ShieldAlert, 
  Zap,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface SettingsProps {
  theme: string;
  setTheme: (t: string) => void;
  scale: string;
  setScale: (s: string) => void;
  username: string;
}

const SettingsPage: React.FC<SettingsProps> = ({ theme, setTheme, scale, setScale, username }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Yangi parollar mos kelmadi!' });
      return;
    }
    
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Parol muvaffaqiyatli yangilandi!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMsg({ type: 'error', text: data.message || 'Xatolik yuz berdi.' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Server bilan aloqa yo\'q.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-5xl font-black text-white tracking-tighter">Boshqaruv <span className="text-cyan-400">Markazi</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Tashqi ko'rinish va xavfsizlik protokollari</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance Settings */}
        <div className="glass-card p-10 rounded-[3rem] space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Palette size={150} />
          </div>
          
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20">
                <Palette size={24} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Tizim Mavzusi</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              {[
                { id: 'cyber', label: 'SOC Dark', color: 'bg-slate-950', border: 'border-cyan-400' },
                { id: 'light', label: 'Classic Light', color: 'bg-slate-50', border: 'border-slate-300' }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${theme === t.id ? 'border-cyan-500 bg-cyan-500/10 scale-105 shadow-xl' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className={`w-14 h-14 rounded-full ${t.color} ${t.border} border-4 shadow-2xl`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{t.label}</span>
                  {theme === t.id && <div className="absolute top-3 right-3 text-cyan-400"><Check size={20} /></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
                <Maximize2 size={24} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Masshtablash</h3>
            </div>
            <div className="flex gap-4">
              {[
                { id: 'small', label: 'Kichik (13px)' },
                { id: 'medium', label: 'O\'rta (16px)' },
                { id: 'large', label: 'Katta (19px)' }
              ].map(s => (
                <button 
                  key={s.id}
                  onClick={() => setScale(s.id)}
                  className={`flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${scale === s.id ? 'bg-purple-500 text-white shadow-xl shadow-purple-500/20 scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="glass-card p-10 rounded-[3rem] space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lock size={150} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20">
              <Lock size={24} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Xavfsizlik</h3>
          </div>

          {msg && (
            <div className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border animate-pulse ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Joriy Kod</label>
              <input 
                required
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-rose-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Yangi Kod</label>
              <input 
                required
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-rose-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kodni Tasdiqlash</label>
              <input 
                required
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-rose-500/50 transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-5 bg-rose-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3"
            >
              Kodni Yangilash <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="glass-card p-12 rounded-[3.5rem] bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/20">
        <div className="flex flex-col md:flex-row items-center gap-10">
           <div className="w-24 h-24 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center justify-center text-cyan-400 shadow-2xl relative">
             <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
             <User size={48} className="relative z-10" />
           </div>
           <div className="flex-1 text-center md:text-left">
             <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-2">Tizim Operatori</p>
             <h4 className="text-4xl font-black text-white tracking-tighter mb-4">{username}</h4>
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest border border-white/5">
                  <Zap size={14} className="text-cyan-400" /> Session: Active
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest border border-white/5">
                  <Monitor size={14} className="text-indigo-400" /> Multi-Layer Access
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-green-500/10 rounded-2xl text-[10px] font-black text-green-400 uppercase tracking-widest border border-green-500/20">
                  <ShieldAlert size={14} /> Firewall: Verified
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
