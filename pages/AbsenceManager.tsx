
import React, { useMemo, useState } from 'react';
import { Student, Attendance, User, Homework } from '../types';
import { 
  PhoneCall, Search, MessageSquare, CheckCircle2, Clock, Calendar, UserX, Phone, AlertCircle,
  ShieldCheck, Save, Loader2, BookOpen, UserCheck, Activity, ClipboardList, Zap
} from 'lucide-react';

interface AbsenceManagerProps {
  students: Student[];
  attendance: Attendance[];
  homework?: Homework[]; 
  user: User;
  onUpdateComment: (attendanceId: string, comment: string) => Promise<void>;
}

const AbsenceManager: React.FC<AbsenceManagerProps> = ({ students, attendance, homework = [], user, onUpdateComment }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'absent' | 'homework' | 'club'>('absent');
  const [searchTerm, setSearchTerm] = useState('');
  const assignedGrades = useMemo(() => user.assignedGrades || [], [user]);

  // Oddiy darslar uchun kelmaganlar
  const absentList = useMemo(() => {
    return attendance
      .filter(a => a.date === selectedDate && a.status === 'absent' && a.subjectId === 'GENERAL')
      .map(a => {
        const student = students.find(s => s.id === a.studentId);
        if (student && (user.role === 'ADMIN' || assignedGrades.includes(student.grade))) {
          return { attendanceRecord: a, student };
        }
        return null;
      })
      .filter(item => {
        if (!item) return false;
        const name = `${item.student.firstName} ${item.student.lastName}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
      }) as { attendanceRecord: Attendance, student: Student }[];
  }, [attendance, students, selectedDate, assignedGrades, searchTerm, user.role]);

  // To'garaklar uchun kelmaganlar
  const clubAbsentList = useMemo(() => {
    return attendance
      .filter(a => a.date === selectedDate && a.status === 'absent' && a.subjectId !== 'GENERAL')
      .map(a => {
        const student = students.find(s => s.id === a.studentId);
        if (student && (user.role === 'ADMIN' || assignedGrades.includes(student.grade))) {
          return { attendanceRecord: a, student };
        }
        return null;
      })
      .filter(item => {
        if (!item) return false;
        const name = `${item.student.firstName} ${item.student.lastName}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
      }) as { attendanceRecord: Attendance, student: Student }[];
  }, [attendance, students, selectedDate, assignedGrades, searchTerm, user.role]);

  // Uy vazifasi bajarmaganlar
  const homeworkDefaulters = useMemo(() => {
    return homework
      .filter(h => h.date === selectedDate && h.status === 'not_done')
      .map(h => {
        const student = students.find(s => s.id === h.studentId);
        if (student && (user.role === 'ADMIN' || assignedGrades.includes(student.grade))) {
          return { h, student };
        }
        return null;
      })
      .filter(item => {
        if (!item) return false;
        const name = `${item.student.firstName} ${item.student.lastName}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
      }) as { h: Homework, student: Student }[];
  }, [homework, students, selectedDate, assignedGrades, searchTerm, user.role]);

  return (
    <div className="space-y-8 animate-fade pb-20 mono">
      <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Activity size={180} className="text-cyan-500" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Audit <span className="text-cyan-400">Monitoring</span></h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">O'quv bo'limi nazorati ostidagi sektorlar</p>
          </div>
          <div className="flex flex-wrap gap-4 p-2 bg-slate-950/50 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
             <button onClick={() => setActiveTab('absent')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'absent' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Darslar ({absentList.length})</button>
             <button onClick={() => setActiveTab('club')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'club' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}>To'garaklar ({clubAbsentList.length})</button>
             <button onClick={() => setActiveTab('homework')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'homework' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-500 hover:text-white'}`}>Vazifalar ({homeworkDefaulters.length})</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={20} />
          <input type="text" placeholder="O'quvchini qidirish..." className="w-full bg-[#0f172a] border border-white/5 rounded-3xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-cyan-500/30 shadow-2xl uppercase tracking-widest text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center gap-4 bg-[#0f172a] p-2 border border-white/5 rounded-3xl shrink-0">
          <Calendar size={18} className="ml-4 text-cyan-500" />
          <input type="date" className="bg-transparent text-white font-black text-sm outline-none px-4 py-3 uppercase cursor-pointer" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {activeTab === 'homework' && homeworkDefaulters.map(({ h, student }) => (
          <div key={h.id} className="bg-[#0f172a] p-8 rounded-[3.5rem] border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all group relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 px-6 py-3 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-3xl">VAZIFA_BAJARILMAGAN</div>
             <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-rose-500/20 flex items-center justify-center text-rose-500 font-black text-2xl italic">{student.firstName[0]}</div>
                <div>
                  <h4 className="text-xl font-black text-white tracking-tight uppercase italic">{student.firstName} {student.lastName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] text-slate-500 font-bold mono">{student.studentId} | {student.grade} SINF</span>
                     <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] font-black text-rose-400 uppercase tracking-widest">{h.subjectId}</span>
                  </div>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><Phone size={12} /> Ota-ona: {student.parentName || "Ism yo'q"}</p>
                   <a href={`tel:${student.parentPhone}`} className="text-rose-400 font-black text-lg tracking-widest">{student.parentPhone || "ALOQA_YO'Q"}</a>
                </div>
                <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-rose-500/10">
                   <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><MessageSquare size={12} /> O'qituvchi Izohi</p>
                   <p className="text-white text-sm font-medium italic">"{h.comment || "Izoh yozilmagan"}"</p>
                </div>
             </div>
          </div>
        ))}

        {activeTab === 'absent' && absentList.map(({ attendanceRecord, student }) => (
          <div key={attendanceRecord.id} className="bg-[#0f172a] p-8 rounded-[3.5rem] border border-white/5 hover:border-cyan-500/20 transition-all group relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 px-6 py-3 bg-cyan-600/10 text-cyan-500 text-[9px] font-black uppercase tracking-widest rounded-bl-3xl border-l border-b border-cyan-500/20">DARSDA_YO'Q</div>
            <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center text-cyan-400 font-black text-2xl italic">{student.firstName[0]}</div>
                <div>
                  <h4 className="text-xl font-black text-white tracking-tight uppercase italic">{student.firstName} {student.lastName}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mono">{student.studentId} | {student.grade} SINF</p>
                </div>
            </div>
            <div className="bg-slate-950/50 p-6 rounded-[2.5rem] border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><Phone size={12} /> Ota-ona_Aloqa</p>
                <a href={`tel:${student.parentPhone}`} className="text-cyan-400 font-black text-lg tracking-widest">{student.parentPhone || "ALOQA_YO'Q"}</a>
            </div>
          </div>
        ))}

        {activeTab === 'club' && clubAbsentList.map(({ attendanceRecord, student }) => (
          <div key={attendanceRecord.id} className="bg-[#0f172a] p-8 rounded-[3.5rem] border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all group relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 px-6 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-3xl">TO'GARAKDA_YO'Q</div>
            <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-2xl italic">{student.firstName[0]}</div>
                <div>
                  <h4 className="text-xl font-black text-white tracking-tight uppercase italic">{student.firstName} {student.lastName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] text-slate-500 font-bold mono">{student.studentId}</span>
                     <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] font-black text-indigo-400 uppercase italic">{attendanceRecord.subjectId}</span>
                  </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><Phone size={12} /> Ota-ona_Aloqa</p>
                   <a href={`tel:${student.parentPhone}`} className="text-white font-black text-lg tracking-widest">{student.parentPhone || "ALOQA_YO'Q"}</a>
                </div>
                <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-indigo-500/10">
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><AlertCircle size={12} /> Ustoz Izohi</p>
                   <p className="text-white text-sm font-medium italic">"{attendanceRecord.comment || "Izoh yozilmagan"}"</p>
                </div>
            </div>
          </div>
        ))}

        {((activeTab === 'homework' && homeworkDefaulters.length === 0) || (activeTab === 'absent' && absentList.length === 0) || (activeTab === 'club' && clubAbsentList.length === 0)) && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-900/40 rounded-[4rem] border border-dashed border-white/5">
             <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center text-slate-800 mb-8 border border-white/5 shadow-2xl"><ShieldCheck size={48} /></div>
             <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-500 text-center italic">Audit_Toza</p>
             <p className="text-[10px] text-slate-700 font-bold uppercase mt-2 italic">Protokol: Hozircha hech qanday muammo aniqlanmadi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsenceManager;
