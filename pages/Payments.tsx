
import React, { useState, useMemo, useEffect } from 'react';
import { Student, User, Payment } from '../types';
import { 
  Search, CreditCard, ArrowUpRight, History, Wallet, UserX, Download, 
  ShieldAlert, FileText, Calendar, ChevronDown, CheckCircle2, Loader2, 
  MessageSquare, Receipt, FileSpreadsheet, Activity, PlusCircle
} from 'lucide-react';
import { generatePaymentReceiptPDF, generateFinancialHistoryPDF } from '../utils/pdfGenerator';

interface PaymentsProps {
  students: Student[];
  onAddPayment: (studentId: string, amount: number, isFinal: boolean, forMonth?: string, comment?: string) => Promise<any>;
  classes: string[];
  user?: User | null;
  initialStudentId?: string;
}

const Payments: React.FC<PaymentsProps> = ({ students, onAddPayment, classes, user, initialStudentId }) => {
  const [searchId, setSearchId] = useState(initialStudentId || '');
  const [amount, setAmount] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [paymentsHistory, setPaymentsHistory] = useState<Payment[]>([]);

  const [bulkMonth, setBulkMonth] = useState(new Date().toISOString().slice(0, 7));
  const [bulkGrade, setBulkGrade] = useState('All');
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => { if (initialStudentId) setSearchId(initialStudentId); }, [initialStudentId]);

  const selectedStudent = useMemo(() => {
    const cleanId = searchId.trim().toLowerCase();
    if (!cleanId) return null;
    return students.find(s => s.studentId.toLowerCase() === cleanId);
  }, [students, searchId]);

  useEffect(() => {
    if (selectedStudent) {
      fetchHistory(selectedStudent.id);
      setSelectedMonth('');
      setComment('');
      setAmount(0);
      setSuccess(false);
    } else { setPaymentsHistory([]); }
  }, [selectedStudent]);

  const fetchHistory = async (id: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/students/${id}/payments`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) { setPaymentsHistory(await res.json()); }
    } catch (e) { console.error(e); } finally { setHistoryLoading(false); }
  };

  const monthNames: Record<string, string> = { '01': 'Yanvar', '02': 'Fevral', '03': 'Mart', '04': 'Aprel', '05': 'May', '06': 'Iyun', '07': 'Iyul', '08': 'Avgust', '09': 'Sentabr', '10': 'Oktabr', '11': 'Noyabr', '12': 'Dekabr' };
  const formatMonth = (mStr: string) => { if (!mStr) return '-'; const [y, m] = mStr.split('-'); return `${monthNames[m]} ${y}`; };

  const monthStatus = useMemo(() => {
    if (!selectedStudent) return [];
    const statusMap: Record<string, { charged: number, paid: number }> = {};
    paymentsHistory.forEach(p => {
      if (!p.forMonth) return;
      if (!statusMap[p.forMonth]) statusMap[p.forMonth] = { charged: 0, paid: 0 };
      if (p.type === 'charge') { statusMap[p.forMonth].charged += p.amount; } else if (p.type === 'income') { statusMap[p.forMonth].paid += p.amount; }
    });
    return Object.entries(statusMap).map(([month, stats]) => ({ month, ...stats, remaining: stats.charged - stats.paid, isFullyPaid: stats.paid >= stats.charged && stats.charged > 0 })).filter(m => m.charged > 0).sort((a, b) => b.month.localeCompare(a.month));
  }, [selectedStudent, paymentsHistory]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || amount <= 0) return;
    setLoading(true);
    try { await onAddPayment(selectedStudent.id, amount, false, selectedMonth, comment); setSuccess(true); fetchHistory(selectedStudent.id); } catch (err) { alert("Xatolik!"); } finally { setLoading(false); }
  };

  const handleBulkCharge = async () => {
    if (!window.confirm(`${bulkGrade} sinflariga qarz hisoblamoqchimisiz?`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/payments/bulk-charge', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ forMonth: bulkMonth, grade: bulkGrade }) });
      if (res.ok) { alert("Muvaffaqiyatli!"); } else { alert((await res.json()).message); }
    } catch (e) { alert("Xatolik!"); } finally { setBulkLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {user?.role === 'ADMIN' && (
        <div className="glass-card p-8 rounded-[3rem] border-amber-500/20 bg-amber-500/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div><h3 className="text-xl font-black text-white flex items-center gap-3"><PlusCircle size={22} className="text-amber-500" /> Oylik To'lov Talabi</h3></div>
            <div className="flex flex-wrap items-center gap-4"><input type="month" value={bulkMonth} onChange={(e) => setBulkMonth(e.target.value)} className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none" /><select value={bulkGrade} onChange={(e) => setBulkGrade(e.target.value)} className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none"><option value="All">Barcha Sinflar</option>{classes.map(c => <option key={c} value={c}>{c} Sinf</option>)}</select><button onClick={handleBulkCharge} disabled={bulkLoading} className="px-8 py-3 bg-amber-500 text-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-30">{bulkLoading ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />} Majburiyat</button></div>
          </div>
        </div>
      )}
      <div className="glass-card p-10 rounded-[3rem] border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"><div className="relative z-10"><h2 className="text-3xl font-black text-white tracking-tighter uppercase">Moliya <span className="text-cyan-400">Markazi</span></h2></div><div className="relative w-full md:w-96 group z-10"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} /><input type="text" placeholder="ID (S1001)" className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white font-black outline-none focus:border-cyan-500 transition-all uppercase shadow-2xl" value={searchId} onChange={(e) => { setSearchId(e.target.value); setSuccess(false); }} /></div></div>
      {selectedStudent && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2 space-y-8"><div className="glass-card p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden animate-in slide-in-from-left-8"><div className="flex flex-col md:flex-row gap-10"><div className="w-32 h-32 rounded-[2.5rem] bg-slate-950 border border-white/5 flex items-center justify-center text-cyan-500 font-black text-5xl shadow-2xl relative">{selectedStudent.firstName[0]}</div><div className="flex-1 space-y-6"><div><h3 className="text-4xl font-black text-white tracking-tighter">{selectedStudent.firstName} {selectedStudent.lastName}</h3><div className="flex items-center gap-3 mt-1"><span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded-lg border border-cyan-500/20">{selectedStudent.grade} SINF</span><span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mono">ID: {selectedStudent.studentId}</span></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Umumiy Balans</p><span className={`text-xl font-black ${selectedStudent.balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{selectedStudent.balance.toLocaleString()} UZS</span></div><div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Shartnoma</p><span className="text-xl font-black text-white">{selectedStudent.monthlyFee.toLocaleString()} UZS</span></div></div></div></div></div><div className="glass-card p-10 rounded-[3rem] border-white/5"><div className="flex items-center justify-between mb-8"><h4 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3"><History size={20} className="text-slate-500" /> Moliyaviy Holat</h4></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{monthStatus.map(m => (<div key={m.month} className={`p-6 rounded-[2rem] border flex flex-col justify-between ${m.isFullyPaid ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}><div className="flex justify-between items-start mb-4"><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">To'lov Oyi</p><h5 className="text-lg font-black text-white">{formatMonth(m.month)}</h5></div>{m.isFullyPaid ? (<div className="p-2 bg-emerald-500 text-black rounded-lg"><CheckCircle2 size={16}/></div>) : (<div className="p-2 bg-rose-500/20 text-rose-500 rounded-lg"><ShieldAlert size={16}/></div>)}</div><div className="space-y-1"><div className="flex justify-between text-[10px] font-bold text-slate-400"><span>Majburiyat:</span><span>{m.charged.toLocaleString()}</span></div><div className="flex justify-between text-[10px] font-bold text-emerald-500"><span>To'landi:</span><span>{m.paid.toLocaleString()}</span></div>{!m.isFullyPaid && (<div className="flex justify-between text-[10px] font-black text-rose-500 pt-2 border-t border-rose-500/10"><span>QARZ:</span><span>{m.remaining.toLocaleString()} UZS</span></div>)}</div></div>))}</div></div></div><div className="lg:col-span-1"><div className="glass-card p-8 rounded-[3.5rem] border-cyan-500/20 sticky top-8 shadow-2xl"><div className="flex items-center gap-4 mb-8"><div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><CreditCard size={24} /></div><h3 className="text-xl font-black text-white uppercase tracking-tighter">To'lov Qabul Qilish</h3></div><form onSubmit={handlePayment} className="space-y-6"><div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">To'lov Oyi</label><div className="relative"><select required className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-cyan-500 transition-all cursor-pointer appearance-none" value={selectedMonth} onChange={(e) => { const m = e.target.value; setSelectedMonth(m); const stat = monthStatus.find(x => x.month === m); if (stat) setAmount(stat.remaining); }}><option value="">Oyni tanlang...</option>{monthStatus.map(m => (<option key={m.month} value={m.month} disabled={m.isFullyPaid}>{formatMonth(m.month)} {m.isFullyPaid ? '(To\'langan)' : `(${m.remaining.toLocaleString()} qoldi)`}</option>))}</select><ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} /></div></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Summa</label><input type="number" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-3xl text-emerald-500 font-black outline-none focus:border-cyan-500 transition-all text-center" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} /></div><button type="submit" disabled={loading || !selectedMonth} className="w-full py-6 bg-cyan-500 text-black font-black rounded-2xl text-[10px] uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20">{loading ? <Loader2 className="animate-spin" size={18} /> : <Receipt size={18} />} TASDIQLASH</button></form></div></div></div>)}
    </div>
  );
};

export default Payments;
