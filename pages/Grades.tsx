
import React, { useState, useMemo, useEffect } from 'react';
import { Student, DailyGrade, Attendance, User, Homework } from '../types';
import { Star, Calendar, Save, Search, Lock, UserX, ShieldCheck, ClipboardCheck, AlertCircle, CheckCircle, FileText, Activity } from 'lucide-react';

interface GradesProps {
  students: Student[];
  grades: DailyGrade[];
  homework: Homework[];
  attendance: Attendance[];
  classes: string[];
  setGrades: (grades: any[]) => Promise<void>;
  setHomework: (hw: any[]) => Promise<void>;
  user?: User | null;
}

const Grades: React.FC<GradesProps> = ({ students, grades, homework, attendance, classes, setGrades, setHomework, user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const teacherGrades = useMemo(() => user?.role === 'TEACHER' ? user.assignedGrades || [] : classes, [user, classes]);
  const [selectedClass, setSelectedClass] = useState(teacherGrades[0] || '');
  const [search, setSearch] = useState('');
  
  // Faqat tanlangan sinf o'quvchilari uchun vaqtinchalik data
  const [tempData, setTempData] = useState<Record<string, { grade: number, hwStatus: 'done' | 'not_done', comment: string, isLocked: boolean, isAbsent: boolean }>>({});

  // Tanlangan sinf o'quvchilari
  const classStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedClass);
  }, [students, selectedClass]);

  // Har safar sinf yoki sana o'zgarganda tempData ni yangilaymiz
  useEffect(() => {
    const initial: Record<string, { grade: number, hwStatus: 'done' | 'not_done', comment: string, isLocked: boolean, isAbsent: boolean }> = {};
    
    // Faqat joriy sinf va sana uchun bazadagi ma'lumotlarni filtrlaymiz
    const dayGrades = grades.filter(g => g.date === selectedDate && (user?.role === 'TEACHER' ? g.subjectId === user.specialization : true));
    const dayHW = homework.filter(h => h.date === selectedDate && (user?.role === 'TEACHER' ? h.subjectId === user.specialization : true));
    const dayAtt = attendance.filter(a => a.date === selectedDate);

    classStudents.forEach(s => {
      const g = dayGrades.find(x => x.studentId === s.id);
      const h = dayHW.find(x => x.studentId === s.id);
      const a = dayAtt.find(x => x.studentId === s.id);
      
      initial[s.id] = { 
        grade: g?.grade || 0, 
        hwStatus: h?.status || 'done', 
        comment: g?.comment || h?.comment || '', 
        isLocked: !!g && user?.role === 'TEACHER', // Faqat o'qituvchi uchun lock
        isAbsent: a?.status === 'absent' 
      };
    });
    setTempData(initial);
  }, [selectedDate, selectedClass, grades, homework, attendance, classStudents, user]);

  const filteredStudents = useMemo(() => {
    return classStudents.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()));
  }, [classStudents, search]);

  const handleUpdate = (sid: string, updates: any) => {
    if (tempData[sid]?.isLocked || tempData[sid]?.isAbsent) return;
    setTempData(prev => ({ ...prev, [sid]: { ...prev[sid], ...updates } }));
  };

  const handleSaveClass = async () => {
    const gradeRecs = [];
    const hwRecs = [];
    
    // Faqat joriy sinf o'quvchilarini saqlaymiz
    for (const student of classStudents) {
      const data = tempData[student.id];
      if (data && !data.isLocked && !data.isAbsent) {
        if (data.grade > 0) {
          gradeRecs.push({ 
            studentId: student.id, 
            date: selectedDate, 
            grade: data.grade, 
            comment: data.comment, 
            subjectId: user?.specialization 
          });
        }
        hwRecs.push({ 
          studentId: student.id, 
          date: selectedDate, 
          status: data.hwStatus, 
          comment: data.comment, 
          subjectId: user?.specialization 
        });
      }
    }

    if (gradeRecs.length === 0 && hwRecs.length === 0) {
      alert("Saqlash uchun yangi ma'lumot yo'q!");
      return;
    }

    try {
      if (gradeRecs.length > 0) await setGrades(gradeRecs);
      if (hwRecs.length > 0) await setHomework(hwRecs);
      alert(`${selectedClass} SINF NATIJALARI SAQLANDI!`);
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  // Qaysi sinflar to'liq baholab bo'linganini aniqlash
  const completedClasses = useMemo(() => {
    return teacherGrades.filter(c => {
      const studentsInClass = students.filter(s => s.grade === c);
      if (studentsInClass.length === 0) return false;
      return studentsInClass.every(s => 
        grades.some(g => g.studentId === s.id && g.date === selectedDate && g.subjectId === user?.specialization) ||
        attendance.some(a => a.studentId === s.id && a.date === selectedDate && a.status === 'absent')
      );
    });
  }, [teacherGrades, students, grades, attendance, selectedDate, user]);

  return (
    <div className="space-y-6 animate-fade mono pb-32">
      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Activity size={150} className="text-indigo-500" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
           <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                <ClipboardCheck className="text-indigo-500" /> Akademik_LOG
              </h2>
              <div className="flex items-center gap-3 mt-2">
                 <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">{user?.specialization}</span>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedDate}</span>
              </div>
           </div>

           <button 
             onClick={handleSaveClass}
             className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
           >
             <Save size={18} /> COMMIT_{selectedClass.replace('-', '_')}
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
           <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
              <Calendar size={18} className="text-indigo-400" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-white font-black text-xs outline-none uppercase w-full" />
           </div>
           <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
              <Search size={18} className="text-slate-500" />
              <input type="text" placeholder="AGENT_QIDIRUV..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-white font-black text-xs outline-none uppercase w-full" />
           </div>
        </div>

        {/* Improved Class Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2 mt-8 custom-scrollbar">
           {teacherGrades.map(c => (
             <button 
               key={c} onClick={() => setSelectedClass(c)}
               className={`relative px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap border transition-all flex items-center gap-3 ${selectedClass === c ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl' : 'bg-slate-950 text-slate-500 border-white/5 hover:border-white/10'}`}
             >
               {c} SINF
               {completedClasses.includes(c) && <CheckCircle size={14} className="text-emerald-500" />}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const data = tempData[student.id] || { grade: 0, hwStatus: 'done', comment: '', isLocked: false, isAbsent: false };
          const isSaved = data.isLocked;
          
          return (
            <div key={student.id} className={`bg-[#0f172a] rounded-[2.5rem] p-8 border transition-all relative overflow-hidden group ${data.isAbsent ? 'opacity-30' : isSaved ? 'border-indigo-500/20' : 'border-white/5 hover:border-white/10'}`}>
              
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-black text-xl transition-all ${isSaved ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-slate-950 border-white/5 text-slate-500'}`}>
                       {student.firstName[0]}
                    </div>
                    <div>
                       <h4 className="font-black text-white text-sm tracking-tight uppercase italic">{student.firstName} {student.lastName}</h4>
                       <p className="text-[9px] text-slate-600 font-bold uppercase mono">{student.studentId}</p>
                    </div>
                 </div>
                 {isSaved && <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Saved</div>}
                 {data.isAbsent && <div className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-rose-500/20">Absent</div>}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Homework_Status</p>
                   <div className="flex gap-2">
                      <button 
                        disabled={isSaved || data.isAbsent}
                        onClick={() => handleUpdate(student.id, { hwStatus: 'done' })}
                        className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${data.hwStatus === 'done' ? 'bg-emerald-500 text-black' : 'bg-slate-950 text-slate-700 border border-white/5'}`}
                      >Done</button>
                      <button 
                        disabled={isSaved || data.isAbsent}
                        onClick={() => handleUpdate(student.id, { hwStatus: 'not_done' })}
                        className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${data.hwStatus === 'not_done' ? 'bg-rose-500 text-white' : 'bg-slate-950 text-slate-700 border border-white/5'}`}
                      >Fail</button>
                   </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Academic_Grade (1-5)</p>
                   <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button 
                          key={num} 
                          disabled={isSaved || data.isAbsent}
                          onClick={() => handleUpdate(student.id, { grade: num })}
                          className={`aspect-square rounded-xl font-black text-sm transition-all border ${data.grade === num ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20' : 'bg-slate-950 text-slate-700 border-white/5 hover:border-white/10'}`}
                        >{num}</button>
                      ))}
                   </div>
                </div>

                <div className="pt-2">
                   <input 
                     type="text" placeholder="LOG_IZOH..." disabled={isSaved || data.isAbsent}
                     value={data.comment} onChange={(e) => handleUpdate(student.id, { comment: e.target.value })}
                     className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-indigo-500/40 font-black uppercase tracking-wider italic"
                   />
                </div>
              </div>
              
              {isSaved && <div className="absolute top-4 right-4 text-indigo-500/30 rotate-12"><Lock size={80} /></div>}
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

export default Grades;
