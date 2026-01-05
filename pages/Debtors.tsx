
import React, { useMemo, useState } from 'react';
import { Student, User } from '../types';
import { 
  AlertTriangle, 
  Search, 
  ArrowRight, 
  Download, 
  Wallet, 
  Timer,
  Clock,
  ShieldAlert
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

  const getDeadline = (regDate: string) => {
    const reg = new Date(regDate);
    const deadline = new Date(reg.getTime() + 4 * 24 * 60 * 60 * 1000); // +4 kun
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return {
      days: daysLeft,
      isExpired: daysLeft <= 0,
      text: daysLeft <= 0 ? "MUDDATI O'TGAN" : `${daysLeft} kun qoldi`
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="glass-card p-10 rounded-[3rem] border-rose-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <ShieldAlert size={150} className="text-rose-500" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Moliyaviy <span className="text-rose-500">Intizom</span></h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">To'lov muddati: Ro'yxatdan o'tgach 4 kun ichida</p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
        <input 
          type="text" placeholder="Qidiruv..." 
          className="w-full bg-slate-900/60 border border-white/5 rounded-3xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-rose-500/30 transition-all"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {debtors.map(s => {
          const deadline = getDeadline(s.registrationDate || new Date().toISOString());
          return (
            <div key={s.id} className={`glass-card p-8 rounded-[3rem] border-white/5 relative overflow-hidden transition-all ${deadline.isExpired ? 'border-rose-500/40 bg-rose-500/5 shadow-2xl shadow-rose-500/10' : ''}`}>
              
              <div className={`absolute top-0 right-0 px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-bl-2xl flex items-center gap-2 ${deadline.isExpired ? 'bg-rose-500 text-white' : 'bg-amber-500/10 text-amber-500'}`}>
                <Clock size={12} /> {deadline.text}
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center font-black text-xl text-slate-400">
                  {s.firstName[0]}
                </div>
                <div>
                   <h4 className="font-black text-white text-lg tracking-tight">{s.firstName} {s.lastName}</h4>
                   <p className="text-[10px] text-slate-600 font-bold uppercase mono">{s.studentId} | {s.grade}</p>
                </div>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 mb-8">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Qarzdorlik Summasi</p>
                 <p className={`text-3xl font-black ${deadline.isExpired ? 'text-rose-500 animate-pulse' : 'text-rose-400'}`}>
                   {Math.abs(s.balance).toLocaleString()} UZS
                 </p>
              </div>

              <button 
                onClick={() => onNavigateToPayment(s.studentId)}
                className="w-full py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                TO'LOVGA O'TISH <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Debtors;
