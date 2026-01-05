
import React, { useMemo, useState } from 'react';
import { Student, Attendance, User } from '../types';
import { 
  PhoneCall, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  UserX, 
  Phone, 
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Save,
  Loader2
} from 'lucide-react';

interface AbsenceManagerProps {
  students: Student[];
  attendance: Attendance[];
  user: User;
  onUpdateComment: (attendanceId: string, comment: string) => Promise<void>;
}

const AbsenceManager: React.FC<AbsenceManagerProps> = ({ students, attendance, user, onUpdateComment }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const assignedGrades = useMemo(() => user.assignedGrades || [], [user]);

  const absentList = useMemo(() => {
    // 1. Bugungi kunda kelmagan barcha yozuvlarni olamiz
    const dailyAbsents = attendance.filter(a => a.date === selectedDate && a.status === 'absent');
    
    // 2. Dublikatlarni (bir xil o'quvchi turli fanlardan kelmagan bo'lsa) olib tashlaymiz
    const uniqueMap = new Map<string, { attendanceRecord: Attendance, student: Student }>();
    
    dailyAbsents.forEach(a => {
      // Agar o'quvchi hali mapga qo'shilmagan bo'lsa, uni qidiramiz
      if (!uniqueMap.has(a.studentId)) {
        // Fix: Removed non-existent s._id property access; use only s.id
        const student = students.find(s => s.id === a.studentId);
        // Faqat xodimga biriktirilgan sinf bo'lsa qo'shamiz
        if (student && assignedGrades.includes(student.grade)) {
          uniqueMap.set(a.studentId, { attendanceRecord: a, student });
        }
      }
    });

    // 3. Qidiruv bo'yicha filtrlaymiz
    return Array.from(uniqueMap.values()).filter(item => {
      const name = `${item.student.firstName} ${item.student.lastName}`.toLowerCase();
      const id = item.student.studentId.toLowerCase();
      const search = searchTerm.toLowerCase();
      return name.includes(search) || id.includes(search);
    });
  }, [attendance, students, selectedDate, assignedGrades, searchTerm]);

  const stats = useMemo(() => ({
    total: absentList.length,
    processed: absentList.filter(a => a.attendanceRecord.comment && a.attendanceRecord.comment.trim().length > 0).length
  }), [absentList]);

  const handleSaveComment = async (id: string, comment: string) => {
    setSavingId(id);
    try {
      await onUpdateComment(id, comment);
    } catch (e) {
      console.error("Comment save error", e);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="glass-card p-10 rounded-[3rem] border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <PhoneCall size={150} className="text-cyan-500" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">Operatsion Call-Markaz</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Davomat <span className="text-cyan-400">Nazorati</span></h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Sizga biriktirilgan guruhlar: {assignedGrades.join(', ')}</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bugungi Kelmaganlar</p>
                <p className="text-3xl font-black text-white">{stats.total} / <span className="text-cyan-500">{stats.processed}</span></p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <Clock size={24} />
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="O'quvchi ID yoki ism bo'yicha qidiruv..." 
            className="w-full bg-slate-900/60 border border-white/5 rounded-3xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-cyan-500/30 transition-all shadow-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 bg-slate-900/60 p-2 border border-white/5 rounded-3xl shrink-0">
          <Calendar size={18} className="ml-4 text-slate-500" />
          <input 
            type="date" 
            className="bg-transparent text-cyan-400 font-black text-sm outline-none px-4 py-3 uppercase cursor-pointer"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {absentList.map(({ attendanceRecord, student }) => (
          <div key={attendanceRecord.id} className="glass-card p-8 rounded-[3.5rem] border-white/5 hover:border-cyan-500/20 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 px-6 py-3 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded-bl-3xl border-l border-b border-rose-500/20">
               ABSENT PROTOCOL
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-cyan-400 font-black text-2xl shadow-xl">
                      {student.firstName[0]}
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-white tracking-tight">{student.firstName} {student.lastName}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mono">{student.studentId} | {student.grade} SINF</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   <div className="bg-slate-950/50 p-5 rounded-[2rem] border border-white/5 group-hover:border-cyan-500/10 transition-colors">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <UserX size={12} /> Ota-ona Ma'lumoti
                      </p>
                      <h5 className="text-white font-bold text-sm mb-2">{student.parentName || 'Ism kiritilmagan'}</h5>
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-cyan-500" />
                        <a 
                          href={`tel:${student.parentPhone}`} 
                          className="text-cyan-400 font-black text-lg hover:underline transition-all"
                        >
                           {student.parentPhone || '+998... (Noma\'lum)'}
                        </a>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                 <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                       <MessageSquare size={12} /> Suhbat Natijasi
                    </label>
                    <textarea 
                      className="w-full h-full min-h-[120px] bg-slate-950/80 border border-white/10 rounded-[2.5rem] p-6 text-sm text-slate-300 font-medium outline-none focus:border-cyan-500/40 transition-all resize-none placeholder:text-slate-800"
                      placeholder="Masalan: Kasal ekan, ertaga keladi..."
                      defaultValue={attendanceRecord.comment}
                      onBlur={(e) => handleSaveComment(attendanceRecord.id, e.target.value)}
                    />
                 </div>
                 <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                       {attendanceRecord.comment ? (
                         <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                           <CheckCircle2 size={14} /> Ishlandi
                         </span>
                       ) : (
                         <span className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                           <AlertCircle size={14} /> Qo'ng'iroq kutilmoqda
                         </span>
                       )}
                    </div>
                    {savingId === attendanceRecord.id ? (
                      <Loader2 size={16} className="animate-spin text-cyan-400" />
                    ) : (
                      <span className="text-[9px] text-slate-600 font-black mono">{attendanceRecord.date}</span>
                    )}
                 </div>
              </div>
            </div>
          </div>
        ))}

        {absentList.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-900/40 rounded-[4rem] border border-dashed border-white/5">
             <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center text-slate-800 mb-8 border border-white/5">
                <ShieldCheck size={48} />
             </div>
             <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-500 text-center">Barcha agentlar nazorat ostida</p>
             <p className="text-[10px] text-slate-700 font-bold uppercase mt-2 italic tracking-widest">Bugungi kunda kutilayotgan qo'ng'iroqlar mavjud emas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsenceManager;
