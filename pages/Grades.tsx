
import React, { useState, useMemo, useEffect } from 'react';
import { Student, DailyGrade, Attendance, User } from '../types';
import { Star, Calendar, Save, Search, Lock, UserX, ShieldCheck } from 'lucide-react';
import { CLASSES } from '../constants';

interface GradesProps {
  students: Student[];
  grades: DailyGrade[];
  attendance: Attendance[];
  setGrades: (grades: DailyGrade[]) => void;
  user?: User | null;
}

const Grades: React.FC<GradesProps> = ({ students, grades, attendance, setGrades, user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const teacherGrades = user?.role === 'TEACHER' ? user.assignedGrades || [] : CLASSES;
  const [selectedClass, setSelectedClass] = useState(teacherGrades[0] || '9-A');
  const [search, setSearch] = useState('');
  const [tempGrades, setTempGrades] = useState<Record<string, { grade: number, comment: string, isLocked: boolean, isAbsent: boolean }>>({});

  useEffect(() => {
    const existingDayGrades: Record<string, { grade: number, comment: string, isLocked: boolean, isAbsent: boolean }> = {};
    
    // 1. Joriy sana va o'qituvchining fani (specialization) bo'yicha baholarni filtrlaymiz
    const dayGrades = grades.filter(g => {
      const isSameDate = g.date === selectedDate;
      if (user?.role === 'TEACHER') {
        return isSameDate && g.subjectId === user.specialization;
      }
      return isSameDate;
    });

    // 2. O'qituvchining fani bo'yicha o'sha kungi davomatni filtrlaymiz
    const dayAttendance = attendance.filter(a => {
      const isSameDate = a.date === selectedDate;
      if (user?.role === 'TEACHER') {
        // @ts-ignore
        return isSameDate && a.subjectId === user.specialization;
      }
      return isSameDate;
    });
    
    students.forEach(s => {
      const gradeRec = dayGrades.find(g => g.studentId === s.id);
      const attRec = dayAttendance.find(a => a.studentId === s.id);
      
      existingDayGrades[s.id] = { 
        grade: gradeRec?.grade || 0, 
        comment: gradeRec?.comment || '',
        isLocked: !!gradeRec && user?.role === 'TEACHER',
        isAbsent: attRec?.status === 'absent'
      };
    });
    setTempGrades(existingDayGrades);
  }, [selectedDate, grades, attendance, students, user]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedClass && `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()));
  }, [students, selectedClass, search]);

  const handleGradeChange = (studentId: string, grade: number) => {
    const current = tempGrades[studentId];
    if (current?.isLocked || current?.isAbsent) return;
    setTempGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], grade }
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    const current = tempGrades[studentId];
    if (current?.isLocked || current?.isAbsent) return;
    setTempGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], comment }
    }));
  };

  const handleSave = async () => {
    if (user?.role === 'TEACHER' && !user.specialization) {
      alert("Sizga fan biriktirilmagan!");
      return;
    }

    const recordsToSave = Object.entries(tempGrades)
      .filter(([studentId, data]) => {
         const student = students.find(s => s.id === studentId);
         return student && student.grade === selectedClass && data.grade > 0 && !data.isLocked && !data.isAbsent;
      })
      .map(([studentId, data]) => ({
        studentId,
        date: selectedDate,
        grade: data.grade,
        comment: data.comment,
        subjectId: user?.specialization
      }));

    if (recordsToSave.length === 0) {
      alert("Yangi saqlanadigan baholar yo'q.");
      return;
    }
    await setGrades(recordsToSave as any);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem] flex flex-col lg:flex-row items-center justify-between gap-6 border-amber-500/20">
        <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
               <Calendar size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sana</p>
               <input 
                 type="date" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="bg-transparent text-white font-black text-xl outline-none cursor-pointer focus:text-amber-500 transition-colors"
               />
             </div>
          </div>
          
          <div className="flex flex-col">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sektor va Fan</p>
             <div className="flex items-center gap-3">
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-2xl px-6 py-2 text-amber-500 font-black outline-none appearance-none cursor-pointer"
                >
                  {teacherGrades.map(c => <option key={c} value={c}>{c} Sinf</option>)}
                </select>
                {user?.role === 'TEACHER' && (
                  <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> {user.specialization}
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500" size={20} />
            <input 
              type="text" 
              placeholder="Agent qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <button 
            onClick={handleSave}
            className="px-8 py-4 bg-amber-500 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-amber-500/20 uppercase tracking-widest text-xs flex items-center gap-2"
          >
            <Save size={18} /> Saqlash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredStudents.map(student => {
          const current = tempGrades[student.id] || { grade: 0, comment: '', isLocked: false, isAbsent: false };
          const isBlocked = current.isLocked || current.isAbsent;

          return (
            <div key={student.id} className={`glass-card p-8 rounded-[3rem] relative group border-indigo-500/10 transition-all ${isBlocked ? 'opacity-50 grayscale-[0.3]' : 'hover:border-indigo-500/30 shadow-xl shadow-indigo-500/5'}`}>
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center font-black text-xl ${current.isAbsent ? 'text-rose-500' : 'text-indigo-400'}`}>
                  {current.isAbsent ? <UserX size={28} /> : student.firstName[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-white text-lg tracking-tight group-hover:text-indigo-400 transition-colors">{student.firstName} {student.lastName}</h4>
                    <div className="flex gap-2">
                       {current.isLocked && <Lock size={14} className="text-slate-500" />}
                       {current.isAbsent && <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded uppercase tracking-tighter">OFFLINE</span>}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mono">{student.studentId}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">O'zlashtirish Bahosi</p>
                    {current.isAbsent && <p className="text-[9px] font-bold text-rose-400 italic">Darsda yo'q</p>}
                  </div>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        disabled={isBlocked}
                        onClick={() => handleGradeChange(student.id, num)}
                        className={`flex-1 aspect-square rounded-2xl flex items-center justify-center font-black text-lg transition-all border-2 ${
                          current.grade === num 
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg' 
                            : 'bg-slate-950 text-slate-600 border-white/5 hover:border-indigo-500/30'
                        } ${isBlocked && current.grade !== num ? 'cursor-not-allowed opacity-20' : ''}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protokol Izohi</p>
                  {isBlocked ? (
                     <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-slate-500 text-xs italic font-medium flex items-center gap-2">
                       {current.isAbsent ? <UserX size={14} /> : <Lock size={14} />}
                       {current.isAbsent ? "Agent darsda qatnashmadi." : (current.comment || "Audit tasdiqlangan.")}
                     </div>
                  ) : (
                    <textarea 
                      rows={2}
                      placeholder="Baholash izohi..."
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-indigo-500/30 transition-all resize-none font-medium placeholder:text-slate-700"
                      value={current.comment}
                      onChange={(e) => handleCommentChange(student.id, e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Grades;
