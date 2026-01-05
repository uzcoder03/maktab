
import React, { useState, useMemo, useEffect } from 'react';
import { Student, Attendance, User } from '../types';
import { Check, X, Calendar as CalendarIcon, Save, Search, Lock, ShieldCheck } from 'lucide-react';
import { CLASSES } from '../constants';

interface AttendanceProps {
  students: Student[];
  attendance: Attendance[];
  setAttendance: (attendance: Attendance[]) => void;
  user?: User | null;
}

const AttendancePage: React.FC<AttendanceProps> = ({ students, attendance, setAttendance, user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const teacherGrades = user?.role === 'TEACHER' ? user.assignedGrades || [] : CLASSES;
  const [selectedClass, setSelectedClass] = useState(teacherGrades[0] || '9-A');
  const [search, setSearch] = useState('');
  const [tempRecords, setTempRecords] = useState<Record<string, { status: 'present' | 'absent', comment: string, isLocked: boolean }>>({});

  useEffect(() => {
    const existingDayAttendance: Record<string, { status: 'present' | 'absent', comment: string, isLocked: boolean }> = {};
    
    // O'qituvchi bo'lsa, faqat uning fani (specialization) bo'yicha davomatlarni filtrlaymiz
    const dayRecords = attendance.filter(a => {
      const isSameDate = a.date === selectedDate;
      if (user?.role === 'TEACHER') {
        // @ts-ignore (subjectId dynamic attribute)
        return isSameDate && a.subjectId === user.specialization;
      }
      return isSameDate;
    });
    
    students.forEach(s => {
      const rec = dayRecords.find(a => a.studentId === s.id);
      existingDayAttendance[s.id] = { 
        status: (rec?.status as 'present' | 'absent') || 'present', 
        comment: rec?.comment || '',
        isLocked: !!rec && user?.role === 'TEACHER'
      };
    });
    setTempRecords(existingDayAttendance);
  }, [selectedDate, attendance, students, user]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedClass && `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()));
  }, [students, selectedClass, search]);

  const handleToggle = (studentId: string, status: 'present' | 'absent') => {
    if (tempRecords[studentId]?.isLocked) return;
    setTempRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleComment = (studentId: string, comment: string) => {
    if (tempRecords[studentId]?.isLocked) return;
    setTempRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], comment }
    }));
  };

  const handleSave = async () => {
    if (user?.role === 'TEACHER' && !user.specialization) {
      alert("Sizga fan biriktirilmagan. Davomatni saqlab bo'lmaydi.");
      return;
    }

    const recordsToSave = Object.entries(tempRecords)
      .filter(([studentId, data]) => {
         const student = students.find(s => s.id === studentId);
         return student && student.grade === selectedClass && !data.isLocked;
      })
      .map(([studentId, data]) => ({
        studentId,
        date: selectedDate,
        status: data.status,
        comment: data.comment,
        subjectId: user?.specialization // Backendda subjectId majburiy
      }));
    
    if (recordsToSave.length === 0) {
      alert("Yangi saqlanadigan ma'lumot yo'q yoki barcha ma'lumotlar qulflangan.");
      return;
    }
    await setAttendance(recordsToSave as any);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem] flex flex-col lg:flex-row items-center justify-between gap-6 border-cyan-500/20">
        <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400">
               <CalendarIcon size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sana</p>
               <input 
                 type="date" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="bg-transparent text-white font-black text-xl outline-none cursor-pointer focus:text-cyan-400 transition-colors"
               />
             </div>
          </div>
          <div className="h-10 w-[1px] bg-white/10 hidden lg:block"></div>
          
          <div className="flex flex-col">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sinf va Fan</p>
             <div className="flex items-center gap-3">
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-2xl px-6 py-2 text-cyan-400 font-black outline-none appearance-none cursor-pointer"
                >
                  {teacherGrades.map(c => <option key={c} value={c}>{c} Sinf</option>)}
                </select>
                {user?.role === 'TEACHER' && (
                  <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> {user.specialization}
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={20} />
            <input 
              type="text" 
              placeholder="Ism bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none focus:border-cyan-500/50"
            />
          </div>
          <button 
            onClick={handleSave}
            className="px-8 py-4 bg-cyan-500 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs flex items-center gap-2"
          >
            <Save size={18} /> Saqlash
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[3rem] overflow-hidden border-white/5">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5">
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Agent (O'quvchi)</th>
              <th className="px-10 py-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Darsdagi Ishtirok</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status / Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStudents.map(student => {
              const current = tempRecords[student.id] || { status: 'present', comment: '', isLocked: false };
              return (
                <tr key={student.id} className={`hover:bg-white/5 transition-all ${current.isLocked ? 'opacity-70' : ''}`}>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-cyan-400 font-black">
                        {student.firstName[0]}
                      </div>
                      <div>
                        <span className="font-bold text-white text-lg">{student.firstName} {student.lastName}</span>
                        <p className="text-[9px] text-slate-600 font-bold mono">{student.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex justify-center gap-4">
                      <button 
                        disabled={current.isLocked}
                        onClick={() => handleToggle(student.id, 'present')} 
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${current.status === 'present' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-white/5 text-slate-500'}`}
                      >
                        Keldi
                      </button>
                      <button 
                        disabled={current.isLocked}
                        onClick={() => handleToggle(student.id, 'absent')} 
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${current.status === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white/5 text-slate-500'}`}
                      >
                        Kelmadi
                      </button>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    {current.isLocked ? (
                      <div className="flex items-center gap-3 text-slate-500 text-sm italic">
                        <Lock size={16} className="text-slate-600" /> 
                        <span className="text-[10px] uppercase font-black tracking-widest">Protokollangan</span>
                        {current.comment && <span className="text-white font-medium ml-2">({current.comment})</span>}
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder="Log uchun izoh..." 
                        value={current.comment} 
                        onChange={(e) => handleComment(student.id, e.target.value)} 
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/30" 
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredStudents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-700 opacity-30 gap-4">
           <Search size={64} />
           <p className="text-xs font-black uppercase tracking-[0.5em]">Agentlar topilmadi</p>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
