
import React from 'react';
import { User, AppState } from '../types';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Activity, 
  Clock, 
  Zap, 
  CheckCircle2,
  Lock,
  Cpu
} from 'lucide-react';

interface ProfileProps {
  user: User;
  state: AppState;
}

const Profile: React.FC<ProfileProps> = ({ user, state }) => {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
  
  // Stats for profile
  const assignedCount = user.role === 'TEACHER' 
    ? state.students.filter(s => user.assignedGrades?.includes(s.grade)).length
    : state.students.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Profile Header Card */}
      <div className="glass-card rounded-[4rem] overflow-hidden border-white/5 relative">
        <div className="h-48 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 relative">
           <div className="absolute inset-0 bg-grid opacity-20"></div>
           <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#020617] to-transparent"></div>
        </div>
        
        <div className="px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row items-end gap-8 -mt-20">
            <div className="w-40 h-40 rounded-[3rem] bg-slate-900 border-8 border-[#020617] flex items-center justify-center text-cyan-400 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <Shield size={64} strokeWidth={1.5} className="relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            
            <div className="flex-1 space-y-2 mb-4">
               <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black text-white tracking-tighter">{fullName}</h1>
                 <div className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-widest">Verified</div>
               </div>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">@{user.username} | {user.role}</p>
            </div>
            
            <div className="flex gap-4 mb-4">
               <div className="bg-slate-900/50 px-8 py-4 rounded-[2rem] border border-white/5 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Status</p>
                  <p className="text-emerald-500 font-black flex items-center gap-2 tracking-widest text-xs"><Activity size={12} /> ACTIVE</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="space-y-8">
           <div className="glass-card p-10 rounded-[3rem] border-white/5">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                 <Lock size={20} className="text-cyan-500" /> Tizim Ma'lumotlari
              </h3>
              <div className="space-y-6">
                 <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
                       <Shield size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Lavozim</p>
                       <p className="text-white font-bold">{user.role}</p>
                    </div>
                 </div>
                 {user.specialization && (
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                         <Zap size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Mutaxassislik</p>
                         <p className="text-white font-bold">{user.specialization}</p>
                      </div>
                    </div>
                 )}
                 <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                       <Clock size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Oxirgi Kirish</p>
                       <p className="text-white font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[3.5rem] relative overflow-hidden shadow-2xl">
              <div className="absolute -right-8 -bottom-8 opacity-20 rotate-12">
                 <Award size={160} className="text-white" />
              </div>
              <h4 className="text-xl font-black text-white mb-2 relative z-10">Velmor Gold Access</h4>
              <p className="text-indigo-100 text-xs font-medium mb-8 opacity-80 relative z-10">Sizda platformaning barcha akademik funksiyalariga to'liq ruxsat mavjud.</p>
              <button className="px-8 py-3 bg-white text-indigo-600 font-black rounded-xl text-[10px] uppercase tracking-widest relative z-10 hover:scale-105 transition-all">Sertifikatni Ko'rish</button>
           </div>
        </div>

        {/* Right Column: Experience and Stats */}
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-10 rounded-[3.5rem] border-cyan-500/20">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Biriktirilgan Sinflar</p>
                 <div className="flex flex-wrap gap-2 mb-6">
                    {user.assignedGrades?.map(grade => (
                       <span key={grade} className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black rounded-xl text-xs">{grade} SINF</span>
                    ))}
                 </div>
                 <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Umumiy O'quvchilar</p>
                    <p className="text-5xl font-black text-white">{assignedCount}</p>
                 </div>
              </div>

              <div className="glass-card p-10 rounded-[3.5rem] border-white/5">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Aktivlik Darajasi</p>
                 <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-24 h-24">
                       <svg className="w-full h-full" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3" />
                          <circle cx="18" cy="18" r="16" fill="none" className="stroke-cyan-500" strokeWidth="3" strokeDasharray="85, 100" strokeLinecap="round" />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center font-black text-white">85%</div>
                    </div>
                    <div>
                       <p className="text-white font-bold text-lg">Mukammal!</p>
                       <p className="text-xs text-slate-500 font-medium">Barcha protokollar o'z vaqtida bajarilgan.</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                       <span>Davomat Auditi</span>
                       <span className="text-cyan-400">100%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                       <div className="w-full h-full bg-cyan-500"></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-card p-10 rounded-[3.5rem] border-white/5">
              <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                 <Cpu size={20} className="text-indigo-500" /> Tizim Loglari
              </h4>
              <div className="space-y-6">
                 {[
                    { action: 'Davomat yangilandi', time: 'Bugun, 09:12', icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
                    { action: 'Profil sozlamalari yangilandi', time: 'Kecha, 18:45', icon: <CheckCircle2 size={16} className="text-cyan-500" /> },
                    { action: 'Baholash protokoli yakunlandi', time: '2 kun oldin', icon: <CheckCircle2 size={16} className="text-indigo-500" /> }
                 ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                       <div className="flex items-center gap-4">
                          {log.icon}
                          <p className="text-sm font-bold text-slate-300">{log.action}</p>
                       </div>
                       <span className="text-[10px] text-slate-600 font-black mono">{log.time}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
