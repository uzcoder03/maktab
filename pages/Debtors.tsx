
import React, { useMemo, useState } from 'react';
import { Student, User } from '../types';
import { 
  AlertTriangle, 
  Search, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  Wallet,
  Timer,
  Zap
} from 'lucide-react';

interface DebtorsProps {
  students: Student[];
  onNavigateToPayment: (studentId: string) => void;
  user?: User | null;
}

const Debtors: React.FC<DebtorsProps> = ({ students, onNavigateToPayment }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const debtors = useMemo(() => {
    return students
      .filter(s => s.balance < 0)
      .filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  const getDeadlineInfo = (regDateStr?: string) => {
    if (!regDateStr) return { daysLeft: 4, isExpired: false, text: "Noma'lum" };
    
    const regDate = new Date(regDateStr);
    const deadlineDate = new Date(regDate.getTime() + (4 * 24 * 60 * 60 * 1000));
    const now = new Date();
    
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { daysLeft: 0, isExpired: true, text: "MUDDATI O'TGAN" };
    }
    return { daysLeft: diffDays, isExpired: false, text: `${diffDays} kun qoldi` };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Risk Alert Banner */}
      <div className="glass-card p-10 rounded-[3rem] border-rose-500/20 relative overflow-hidden bg-gradient-to-br from-rose-500/5 to-transparent">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <ShieldAlert size={200} className="text-rose-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
             <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Moliyaviy Xavfsizlik Protokoli</span>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase mb-4">Qarzdorlar <span className="text-rose-500">Monitoringi</span></h2>
          <p className="text-slate-400 font-medium max-w-xl">
            Tizim yangi o'quvchilar uchun 4 kunlik imtiyozli muddatni nazorat qiladi. 
            Muddati o'tgan qarzdorliklar avtomatik ravishda bloklash ro'yxatiga tushadi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-8 rounded-[2.5rem] border-white/5 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Umumiy Qarz</p>
               <p className="text-3xl font-black text-white">{Math.abs(debtors.reduce((a,b) => a + b.balance, 0)).toLocaleString()} UZS</p>
            </div>
            <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500"><Wallet size={24}/></div>
         </div>
         <div className="glass-card p-8 rounded-[2.5rem] border-white/5 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Qarzdor Agentlar</p>
               <p className="text-3xl font-black text-white">{debtors.length}</p>
            </div>
            <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-500"><Zap size={24}/></div>
         </div>
         <div className="glass-card p-8 rounded-[2.5rem] border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Muddati O'tganlar</p>
               <p className="text-3xl font-black text-white">
                 {debtors.filter(d => getDeadlineInfo(d.registrationDate).isExpired).length}
               </p>
            </div>
            <div className="p-4 bg-rose-500/20 rounded-2xl text-rose-500 animate-pulse"><Timer size={24}/></div>
         </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Agent qidiruvi (ID yoki Ism)..." 
          className="w-full bg-slate-900 border border-white/5 rounded-3xl pl-16 pr-8 py-5 text-white font-bold outline-none focus:border-rose-500/30 transition-all shadow-2xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {debtors.map(s => {
          const deadline = getDeadlineInfo(s.registrationDate);
          return (
            <div key={s.id} className={`glass-card p-8 rounded-[3.5rem] border-white/5 transition-all group relative overflow-hidden ${deadline.isExpired ? 'border-rose-500/40 bg-rose-500/5 shadow-2xl shadow-rose-500/10' : ''}`}>
              
              <div className={`absolute top-0 right-0 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-bl-3xl flex items-center gap-2 ${deadline.isExpired ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500/10 text-amber-500'}`}>
                <Clock size={14} /> {deadline.text}
              </div>

              <div className="flex items-center gap-5 mb-8">
                <div className={`w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center font-black text-2xl border ${deadline.isExpired ? 'border-rose-500 text-rose-500' : 'border-white/5 text-slate-400'}`}>
                  {s.firstName[0]}
                </div>
                <div>
                   <h4 className="font-black text-white text-xl tracking-tighter">{s.firstName} {s.lastName}</h4>
                   <p className="text-[10px] text-slate-600 font-bold uppercase mono tracking-widest">{s.studentId} | {s.grade}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mavjud Qarzdorlik</p>
                   <p className={`text-4xl font-black ${deadline.isExpired ? 'text-rose-500' : 'text-rose-400'}`}>
                     {Math.abs(s.balance).toLocaleString()} <span className="text-lg">UZS</span>
                   </p>
                </div>
                <div className="flex justify-between px-4">
                   <div className="text-center">
                      <p className="text-[8px] font-black text-slate-600 uppercase">Kontrakt</p>
                      <p className="text-xs font-bold text-slate-400">{s.monthlyFee.toLocaleString()}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[8px] font-black text-slate-600 uppercase">Ro'yxatdan o'tdi</p>
                      <p className="text-xs font-bold text-slate-400">{new Date(s.registrationDate || '').toLocaleDateString()}</p>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => onNavigateToPayment(s.studentId)}
                className="w-full py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                TO'LOVNI QABUL QILISH <ArrowRight size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Debtors;
