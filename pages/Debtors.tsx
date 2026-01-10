
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
  ArrowUpDown,
  Phone,
  Activity,
  Zap
} from 'lucide-react';

interface DebtorsProps {
  students: Student[];
  onNavigateToPayment: (studentId: string) => void;
  user?: User | null;
}

const Debtors: React.FC<DebtorsProps> = ({ students, onNavigateToPayment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'debt' | 'date'>('debt');

  const getDeadlineInfo = (regDateStr?: string) => {
    if (!regDateStr) return { daysLeft: 4, isExpired: false, text: "Noma'lum" };
    const regDate = new Date(regDateStr);
    const deadlineDate = new Date(regDate.getTime() + (4 * 24 * 60 * 60 * 1000));
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { daysLeft: 0, isExpired: true, text: "MUDDATI O'TGAN!" };
    return { daysLeft: diffDays, isExpired: false, text: `${diffDays} kun qoldi` };
  };

  const debtors = useMemo(() => {
    let list = students
      .filter(s => s.balance < 0)
      .filter(s => {
        const name = `${s.firstName} ${s.lastName}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      });

    if (sortBy === 'debt') {
      list.sort((a, b) => a.balance - b.balance);
    } else {
      list.sort((a, b) => new Date(a.registrationDate || '').getTime() - new Date(b.registrationDate || '').getTime());
    }
    return list;
  }, [students, searchTerm, sortBy]);

  const stats = useMemo(() => {
    const expiredCount = debtors.filter(d => getDeadlineInfo(d.registrationDate).isExpired).length;
    const totalDebt = Math.abs(debtors.reduce((a, b) => a + b.balance, 0));
    return { expiredCount, totalDebt };
  }, [debtors]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Alert Banner */}
      <div className="hud-card p-12 border-rose-500/20 bg-rose-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <ShieldAlert size={220} className="text-rose-500" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
               <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping"></span>
               <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] mono">Financial_Security_Risk_Detected</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-6">Moliyaviy <span className="text-rose-500">Audit</span></h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Tizimda to'lov intizomi nazorati ostida. Muddati o'tgan o'quvchilar bilan bog'lanish va moliya balansini tiklash tavsiya etiladi.
            </p>
          </div>
          <div className="flex gap-6">
             <div className="hud-card p-8 border-white/5 bg-slate-950/50 min-w-[200px] text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Umumiy Defitsit</p>
                <p className="text-3xl font-black text-white">{stats.totalDebt.toLocaleString()} <span className="text-xs">UZS</span></p>
             </div>
             <div className="hud-card p-8 border-rose-500/20 bg-rose-500/10 min-w-[200px] text-center">
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-3">Xavf Darajasi</p>
                <p className="text-3xl font-black text-rose-500">{stats.expiredCount} <span className="text-xs">Agent</span></p>
             </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Qarzdor agentni qidirish..." 
            className="w-full bg-slate-900 border border-white/5 rounded-3xl pl-16 pr-8 py-5 text-white font-bold outline-none focus:border-rose-500/30 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 p-2 bg-slate-900/50 border border-white/5 rounded-3xl">
           <button onClick={() => setSortBy('debt')} className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'debt' ? 'bg-rose-500 text-white' : 'text-slate-500 hover:text-white'}`}>Qarz bo'yicha</button>
           <button onClick={() => setSortBy('date')} className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'date' ? 'bg-rose-500 text-white' : 'text-slate-500 hover:text-white'}`}>Vaqt bo'yicha</button>
        </div>
      </div>

      {/* Debtors Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {debtors.map(s => {
          const deadline = getDeadlineInfo(s.registrationDate);
          return (
            <div key={s.id} className={`hud-card p-10 transition-all duration-500 group relative ${deadline.isExpired ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/5 hover:border-white/10'}`}>
              
              <div className={`absolute top-0 right-0 px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] rounded-bl-3xl flex items-center gap-2 ${deadline.isExpired ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500/20 text-amber-500'}`}>
                <Timer size={14} /> {deadline.text}
              </div>

              <div className="flex items-center gap-6 mb-10">
                <div className={`w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center font-black text-2xl border ${deadline.isExpired ? 'border-rose-500 text-rose-500' : 'border-white/5 text-slate-500'}`}>
                  {s.firstName[0]}
                </div>
                <div>
                   <h4 className="text-xl font-black text-white tracking-tighter uppercase">{s.firstName} {s.lastName}</h4>
                   <p className="text-[10px] text-slate-600 font-black mono tracking-widest">{s.studentId} | {s.grade} SINF</p>
                </div>
              </div>

              <div className="bg-slate-950 p-6 border border-white/5 mb-8 rounded-none">
                 <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 mono">Current_Debt_Amount</p>
                 <p className={`text-4xl font-black ${deadline.isExpired ? 'text-rose-500' : 'text-rose-400'} tracking-tighter`}>
                   {Math.abs(s.balance).toLocaleString()} <span className="text-xs">UZS</span>
                 </p>
              </div>
              
              <div className="space-y-4 mb-10">
                 <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-600 uppercase mono">Contact_Parent:</span>
                    <a href={`tel:${s.parentPhone}`} className="text-white hover:text-rose-500 transition-colors flex items-center gap-2 underline">{s.parentPhone || "Noma'lum"}</a>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-600 uppercase mono">Last_Update:</span>
                    <span className="text-slate-400">{new Date(s.registrationDate || '').toLocaleDateString()}</span>
                 </div>
              </div>

              <button 
                onClick={() => onNavigateToPayment(s.studentId)}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] hover:bg-rose-500 hover:text-white transition-all active:scale-95"
              >
                Kirim_Qilish <ArrowRight size={18} className="inline ml-2" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Debtors;
