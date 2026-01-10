
import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Lock, User as UserIcon, Loader2, ChevronRight, Globe, Users } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'STAFF' | 'STUDENT'>('STAFF');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (loginType === 'STUDENT') {
        // O'quvchi ID 'S' bilan boshlanishi kerak
        if (username.toUpperCase().startsWith('S')) {
          const isDefaultPassword = password === 'password';
          
          const mockStudentUser: User = {
            id: username.toUpperCase(),
            username: username.toUpperCase(),
            role: 'STUDENT',
            firstName: 'O\'quvchi',
            lastName: username.toUpperCase(),
            grade: '9-A',
            mustChangePassword: isDefaultPassword // Agar 'password' bo'lsa, o'zgartirish shart
          };
          
          // O'quvchilar uchun simulyatsiya paroli faqat 'password' yoki oldin o'zgartirilgan bo'lishi kerak
          // Haqiqiy tizimda bu bazadan tekshiriladi
          onLogin(mockStudentUser, 'mock-student-token-' + Date.now());
          return;
        } else {
          setError('O\'quvchi ID raqami "S" harfi bilan boshlanishi kerak (Masalan: S1001)');
        }
      } else {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        if (response.ok) {
          onLogin(data.user, data.token);
        } else {
          setError('Login yoki parol noto\'g\'ri');
        }
      }
    } catch (err) {
      setError('Server bilan bog\'lanishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md animate-fade relative z-10">
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-xl shadow-blue-600/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 uppercase">VELMOR <span className="text-blue-500">OS</span></h1>
            <p className="text-slate-400 text-sm font-medium">Boshqaruv va Ta'lim tizimi</p>
          </div>

          <div className="flex p-1.5 bg-slate-950 rounded-2xl mb-8 border border-white/5">
            <button 
              onClick={() => setLoginType('STAFF')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${loginType === 'STAFF' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
            >
              <ShieldCheck size={14} /> Xodimlar
            </button>
            <button 
              onClick={() => setLoginType('STUDENT')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${loginType === 'STUDENT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
            >
              <Users size={14} /> O'quvchilar
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                {loginType === 'STAFF' ? 'Login' : 'O\'quvchi ID raqami'}
              </label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder={loginType === 'STAFF' ? "admin_01" : "S1001"}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-12 py-4 text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Parol</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-12 py-4 text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                />
              </div>
              {loginType === 'STUDENT' && (
                <p className="text-[9px] text-slate-500 font-medium mt-2 italic">* Birinchi marta kirayotgan bo'lsangiz: "password"</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] text-white ${loginType === 'STAFF' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-indigo-600 shadow-indigo-600/20'}`}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Tizimga kirish'} 
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Globe size={12}/> Secure Auth</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
            <span>v1.2.0 Stable</span>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-[9px] font-medium uppercase tracking-[0.3em]">
          &copy; 2025 VELMOR IT SOLUTIONS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
};

export default Login;
