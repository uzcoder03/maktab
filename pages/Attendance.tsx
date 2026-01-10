
import React, { useState, useMemo, useEffect } from 'react';
import { Student, Attendance, User } from '../types';
import { Check, X, Calendar as CalendarIcon, Save, Search, Lock, ShieldCheck, UserCheck, UserX, Activity, CheckCircle, AlertCircle } from 'lucide-react';

interface AttendanceProps {
  students: Student[];
  attendance: Attendance[];
  setAttendance: (attendance: Attendance[]) => void;
  classes: string[];
  user?: User | null;
}

const AttendancePage: React.FC<AttendanceProps> = ({ students, attendance, setAttendance, classes, user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const teacherGrades = useMemo(() => user?.role === 'TEACHER' ? user.assignedGrades || [] : classes, [user, classes]);
  const [selectedClass, setSelectedClass] = useState(teacherGrades[0] || '');
  const [search, setSearch] = useState('');
  
  // Faqat tanlangan sinf uchun vaqtinchalik data
  const [tempRecords, setTempRecords] = useState<Record<string, { status: 'present' | 'absent', comment: string, isLocked: boolean }>>({});

  const classStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedClass);
  }, [students, selectedClass]);

  useEffect(() => {
    const existingDayAttendance: Record<string, { status: 'present' | 'absent', comment: string, isLocked: boolean }> = {};
    
    // Bazadagi davomat ma'lumotlari
    const dayRecords = attendance.filter(a => a.date === selectedDate);
    
    classStudents.forEach(s => {
      const rec = dayRecords.find(a => a.studentId === s.id);
      existingDayAttendance[s.id] = { 
        status: (rec?.status as 'present' | 'absent') || 'present', 
        comment: rec?.comment || '',
        isLocked: !!rec && user?.role === 'TEACHER'
      };
    });
    setTempRecords(existingDayAttendance);
  }, [selectedDate, selectedClass, attendance, classStudents, user]);

  const filteredStudents = useMemo(() => {
    return classStudents.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()));
  }, [classStudents, search]);

  const handleToggle = (studentId: string, status: 'present' | 'absent') => {
    if (tempRecords[studentId]?.isLocked) return;
    setTempRecords(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const handleSaveClass = async () => {
    const recordsToSave = classStudents
      .filter(s => tempRecords[s.id] && !tempRecords[s.id].isLocked)
      .map(s => ({
        studentId: s.id, 
        date: selectedDate, 
        status: tempRecords[s.id].status, 
        comment: tempRecords[s.id].comment, 
        subjectId: user?.specialization || 'GENERAL'
      }));

    if (recordsToSave.length === 0) {
      alert("Hamma ma'lumotlar allaqachon saqlangan!");
      return;
    }

    try {
      await setAttendance(recordsToSave as any);
      alert(`${selectedClass} SINF DAVOMATI SAQLANDI!`);
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  const completedClasses = useMemo(() => {
    return teacherGrades.filter(c => {
      const studs = students.filter(s => s.grade === c);
      if (studs.length === 0) return false;
      return studs.every(s => attendance.some(a => a.studentId === s.id && a.date === selectedDate));
    });
  }, [teacherGrades, students, attendance, selectedDate]);

  return (
    <div className="space-y-6 animate-fade mono pb-32">
      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Activity size={150} className="text-cyan-500" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
           <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                <CheckCircle className="text-cyan-500" /> Davomat_ROLL
              </h2>
              <p className="text-[10px] font-black text-cyan-500/50 uppercase tracking-widest mt-1 italic">Sana: {selectedDate}</p>
           </div>
           <button 
             onClick={handleSaveClass} 
             className="w-full md:w-auto px-10 py-5 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-500 active:scale-95 transition-all shadow-xl shadow-cyan-600/20 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
           >
             <Save size={18} /> SAVE_{selectedClass.replace('-', '_')}
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
           <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
              <CalendarIcon size={18} className="text-cyan-500" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-white font-black text-xs outline-none uppercase w-full" />
           </div>
           <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
              <Search size={18} className="text-slate-500" />
              <input type="text" placeholder="AGENT_QIDIRUV..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-white font-black text-xs outline-none uppercase w-full" />
           </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 mt-8 custom-scrollbar">
           {teacherGrades.map(c => (
             <button 
               key={c} onClick={() => setSelectedClass(c)}
               className={`relative px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap border transition-all flex items-center gap-3 ${selectedClass === c ? 'bg-cyan-600 text-white border-cyan-400 shadow-xl' : 'bg-slate-950 text-slate-500 border-white/5 hover:border-white/10'}`}
             >
               {c} SINF
               {completedClasses.includes(c) && <CheckCircle size={14} className="text-emerald-500" />}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const current = tempRecords[student.id] || { status: 'present', comment: '', isLocked: false };
          const isSaved = current.isLocked;

          return (
            <div key={student.id} className={`bg-[#0f172a] rounded-[2.5rem] p-8 border transition-all relative overflow-hidden group ${isSaved ? 'border-cyan-500/20' : 'border-white/5 hover:border-white/10'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-black text-xl transition-all ${isSaved ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-slate-950 border-white/5 text-slate-500'}`}>
                    {student.firstName[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm tracking-tight uppercase italic">{student.firstName} {student.lastName}</h4>
                    <p className="text-[9px] text-slate-600 font-bold uppercase mono">{student.studentId}</p>
                  </div>
                </div>
                {isSaved && <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Synced</div>}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  disabled={isSaved}
                  onClick={() => handleToggle(student.id, 'present')}
                  className={`flex items-center justify-center gap-3 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${current.status === 'present' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-950 text-slate-700 border border-white/5'}`}
                >
                  <UserCheck size={16} /> Keldi
                </button>
                <button 
                  disabled={isSaved}
                  onClick={() => handleToggle(student.id, 'absent')}
                  className={`flex items-center justify-center gap-3 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${current.status === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-950 text-slate-700 border border-white/5'}`}
                >
                  <UserX size={16} /> Yo'q
                </button>
              </div>

              <input 
                type="text" placeholder="LOG_IZOH..." disabled={isSaved}
                value={current.comment} onChange={(e) => setTempRecords(prev => ({ ...prev, [student.id]: { ...prev[student.id], comment: e.target.value } }))}
                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-cyan-500/40 font-black uppercase tracking-wider italic"
              />

              {isSaved && <div className="absolute top-4 right-4 text-cyan-500/30 rotate-12"><Lock size={80} /></div>}
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="col-span-full py-20 bg-slate-900/40 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center opacity-30">
             <AlertCircle size={48} className="mb-4" />
             <p className="text-xs font-black uppercase tracking-widest">Sinfda o'quvchilar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
