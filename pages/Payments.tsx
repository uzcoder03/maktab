
import React, { useState, useMemo, useEffect } from 'react';
import { Student, User, Payment } from '../types';
import { 
  Search, CreditCard, ArrowUpRight, History, Wallet, UserX, Download, 
  ShieldAlert, FileText, Calendar, ChevronDown, CheckCircle2, Loader2, 
  MessageSquare, Receipt, FileSpreadsheet, Activity
} from 'lucide-react';
import { generatePaymentReceiptPDF, generateFinancialHistoryPDF } from '../utils/pdfGenerator';

interface PaymentsProps {
  students: Student[];
  onAddPayment: (studentId: string, amount: number, isFinal: boolean, forMonth?: string, comment?: string) => Promise<any>;
  user?: User | null;
  initialStudentId?: string;
}

const Payments: React.FC<PaymentsProps> = ({ students, onAddPayment, user, initialStudentId }) => {
  const [searchId, setSearchId] = useState(initialStudentId || '');
  const [amount, setAmount] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastPaymentData, setLastPaymentData] = useState<Payment | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [paymentsHistory, setPaymentsHistory] = useState<Payment[]>([]);

  useEffect(() => {
    if (initialStudentId) {
      setSearchId(initialStudentId);
    }
  }, [initialStudentId]);

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
      setAmount(selectedStudent.monthlyFee || 0);
      setSuccess(false);
      setLastPaymentData(null);
    } else {
      setPaymentsHistory([]);
    }
  }, [selectedStudent]);

  const fetchHistory = async (id: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/students/${id}/payments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentsHistory(data);
      }
    } catch (e) {
      console.error("History fetch error", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || amount <= 0) return;

    setLoading(true);
    try {
      const payment = await onAddPayment(selectedStudent.id, amount, false, selectedMonth, comment);
      setLastPaymentData(payment);
      setSuccess(true);
      fetchHistory(selectedStudent.id);
    } catch (err) {
      alert("To'lovni saqlashda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  const monthNames: Record<string, string> = {
    '01': 'Yanvar', '02': 'Fevral', '03': 'Mart', '04': 'Aprel',
    '05': 'May', '06': 'Iyun', '07': 'Iyul', '08': 'Avgust',
    '09': 'Sentabr', '10': 'Oktabr', '11': 'Noyabr', '12': 'Dekabr'
  };

  const formatMonth = (mStr: string) => {
    if (!mStr) return '-';
    const [y, m] = mStr.split('-');
    return `${monthNames[m]} ${y}`;
  };

  const unpaidMonths = useMemo(() => {
    if (!selectedStudent) return [];
    const chargedMonths = paymentsHistory.filter(p => p.type === 'charge').map(p => p.forMonth);
    const paidMonths = new Set(paymentsHistory.filter(p => p.type === 'income' && p.forMonth).map(p => p.forMonth));
    return Array.from(new Set(chargedMonths.filter(m => m && !paidMonths.has(m))));
  }, [selectedStudent, paymentsHistory]);

  const handleDownloadReceipt = () => {
    if (selectedStudent && amount > 0) {
      generatePaymentReceiptPDF(
        selectedStudent, 
        amount, 
        false, 
        user?.firstName || 'Admin', 
        selectedMonth
      );
    }
  };

  const handleDownloadHistory = () => {
    if (selectedStudent) {
      generateFinancialHistoryPDF(selectedStudent, paymentsHistory, user?.firstName || 'Admin');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Search Section */}
      <div className="glass-card p-10 rounded-[3rem] border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Activity size={120} className="text-cyan-500" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Moliya <span className="text-cyan-400">Markazi</span></h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">O'quvchi ID raqamini kiriting</p>
        </div>
        <div className="relative w-full md:w-96 group z-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Masalan: S1001" 
            className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white font-black outline-none focus:border-cyan-500 transition-all uppercase placeholder:normal-case shadow-2xl"
            value={searchId}
            onChange={(e) => { setSearchId(e.target.value); setSuccess(false); }}
          />
        </div>
      </div>

      {!selectedStudent && searchId.trim().length > 2 && (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-900/40 rounded-[3rem] border border-white/5 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center text-slate-800 mb-6 border border-white/5">
             <UserX size={40} />
          </div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">O'quvchi topilmadi</p>
          <p className="text-[10px] text-slate-700 mt-2 italic font-bold">Qidirilayotgan ID bazada mavjud emas.</p>
        </div>
      )}

      {selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden animate-in slide-in-from-left-8">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full"></div>
              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-950 border border-white/10 flex items-center justify-center text-cyan-500 font-black text-5xl shadow-2xl relative">
                  {selectedStudent.firstName[0]}
                  <div className="absolute -top-2 -right-2 p-2 bg-cyan-500 rounded-lg text-black">
                     <ShieldAlert size={16} />
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded-lg border border-cyan-500/20">{selectedStudent.grade} SINF</span>
                       <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mono">ID: {selectedStudent.studentId}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 group hover:border-cyan-500/20 transition-all">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Wallet size={12} /> Joriy Balans
                      </p>
                      <span className={`text-xl font-black ${selectedStudent.balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {selectedStudent.balance.toLocaleString()} UZS
                      </span>
                    </div>
                    <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 group hover:border-amber-500/20 transition-all">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileSpreadsheet size={12} /> Shartnoma (Oy)
                      </p>
                      <span className="text-xl font-black text-white">{selectedStudent.monthlyFee.toLocaleString()} UZS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[3rem] border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <History size={20} className="text-slate-500" /> Tranzaksiyalar Arxivi
                </h4>
                <button 
                  onClick={handleDownloadHistory}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-slate-400 font-black rounded-xl text-[10px] uppercase border border-white/5 hover:bg-white/10 transition-all"
                >
                  <Download size={14} /> PDF Yuklash
                </button>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {historyLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cyan-500" /></div>
                ) : (
                  paymentsHistory.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-950/40 rounded-2xl border border-white/5 hover:bg-cyan-500/5 hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${p.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                          {p.type === 'income' ? <ArrowUpRight size={18} /> : <CreditCard size={18} />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">{p.type === 'income' ? `Kirim (${formatMonth(p.forMonth || '')})` : `Qarzdorlik (${formatMonth(p.forMonth || '')})`}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] text-slate-500 font-bold mono">{new Date(p.date).toLocaleString()}</span>
                            {p.comment && <span className="text-[9px] text-cyan-500/60 font-medium italic">"{p.comment}"</span>}
                          </div>
                        </div>
                      </div>
                      <span className={`text-sm font-black ${p.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {p.type === 'income' ? '+' : '-'}{p.amount.toLocaleString()} UZS
                      </span>
                    </div>
                  ))
                )}
                {paymentsHistory.length === 0 && !historyLoading && (
                  <div className="flex flex-col items-center justify-center py-16 opacity-30">
                     <FileText size={48} className="text-slate-700" />
                     <p className="text-[10px] font-black uppercase tracking-widest mt-4">Tranzaksiyalar topilmadi</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card p-8 rounded-[3.5rem] border-cyan-500/20 sticky top-8 animate-in slide-in-from-right-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <CreditCard size={24} />
                 </div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter">To'lov Qabul Qilish</h3>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">To'lov Oyi</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-cyan-500 transition-all cursor-pointer appearance-none"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <option value="">Umumiy balansga qo'shish...</option>
                      {unpaidMonths.map(m => <option key={m} value={m}>{formatMonth(m)} Oyi uchun</option>)}
                      {unpaidMonths.length === 0 && (
                        <option value={new Date().toISOString().slice(0, 7)}>{formatMonth(new Date().toISOString().slice(0, 7))} (Joriy)</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Summa (UZS)</label>
                     <span className="text-[9px] font-bold text-cyan-500/50">Norma: {selectedStudent.monthlyFee.toLocaleString()}</span>
                  </div>
                  <input 
                    type="number" 
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-3xl text-emerald-500 font-black outline-none focus:border-cyan-500 transition-all text-center"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Izoh (Audit Log)</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-5 top-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" size={18} />
                    <textarea 
                      rows={2}
                      placeholder="To'lov haqida qo'shimcha ma'lumot..."
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm text-slate-300 font-medium outline-none focus:border-cyan-500 transition-all resize-none"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-6 bg-cyan-500 text-black font-black rounded-2xl text-[10px] uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Receipt size={18} />}
                  {loading ? "SAQLANMOQDA..." : "TO'LOVNI TASDIQLASH"}
                </button>
              </form>
              
              {success && (
                <div className="mt-8 space-y-4 animate-in zoom-in-95">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                    <p className="text-emerald-500 text-[10px] font-black uppercase flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Muvaffaqiyatli Saqlandi!
                    </p>
                  </div>
                  <button 
                    onClick={handleDownloadReceipt}
                    className="w-full py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase flex items-center justify-center gap-3 hover:bg-cyan-50 transition-all shadow-xl"
                  >
                    <Download size={18} /> CHECKNI YUKLAB OLISH (PDF)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
