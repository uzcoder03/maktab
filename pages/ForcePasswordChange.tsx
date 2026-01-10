
import React, { useState } from 'react';
import { User } from '../types';
import { ShieldAlert, Lock, ArrowRight, CheckCircle2, Loader2, Key } from 'lucide-react';

interface ForcePasswordChangeProps {
  user: User;
  onPasswordChanged: () => void;
}

const ForcePasswordChange: React.FC<ForcePasswordChangeProps> = ({ user, onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword === 'password') {
      setError('Yangi parol eski standart paroldan farq qilishi kerak!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi shart!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Parollar mos kelmadi!');
      return;
    }

    setLoading(true);
    try {
      // Haqiqiy tizimda API chaqiriladi
      // fetch('/api/user/password-reset', ...)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulyatsiya
      
      // LocalStorage ni yangilash
      const savedUser = JSON.parse(localStorage.getItem('educontrol_user') || '{}');
      savedUser.mustChangePassword = false;
      localStorage.setItem('educontrol_user', JSON.stringify(savedUser));
      
      onPasswordChanged();
    } catch (err) {
      setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-lg animate-fade relative z-10">
        <div className="bg-[#0f172a] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
          <div className="bg-blue-600 p-10 text-white relative">
             <div className="absolute top-0 right-0 p-8 opacity-20"><Key size={80} /></div>
             <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Xavfsizlik Protokoli</h2>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80 italic">Xush kelibsiz, {user.username}</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-5 items-start">
               <ShieldAlert className="text-blue-500 shrink-0" size={24} />
               <p className="text-xs font-medium text-slate-400 leading-relaxed">
                 Siz tizimga birinchi marta kirdingiz. Xavfsizlik qoidalariga ko'ra, standart parolni o'zgartirishingiz shart. 
                 Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak.
               </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Yangi Parol</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    required type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-14 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Parolni Tasdiqlang</label>
                <div className="relative">
                  <CheckCircle2 size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    required type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-14 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>PAROLNI YANGILASH <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
