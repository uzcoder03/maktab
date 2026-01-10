
import React, { useMemo, useState } from 'react';
import { AppState, User, DailyGrade } from '../types';
import { 
  Star, 
  BookOpen, 
  Calendar, 
  Filter, 
  ChevronRight, 
  Activity, 
  ClipboardList,
  Search,
  MessageSquare
} from 'lucide-react';

interface StudentGradesProps {
  state: AppState;
  user: User;
}

const StudentGrades: React.FC<StudentGradesProps> = ({ state, user }) => {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // O'quvchining barcha baholarini olish (teskari tartibda)
  const myGrades = useMemo(() => {
    // Tizimga kirgan user ID sini o'quvchi ID sifatida ishlatamiz
    return state.dailyGrades
      .filter(g => g.studentId === user.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.dailyGrades, user.id]);

  // Bugungi baholar
  const todayDate = new Date().toISOString().split('T')[0];
  const todayGrades = useMemo(() => {
    return myGrades.filter(g => g.date === todayDate);
  }, [myGrades, todayDate]);

  // Fanlar ro'yxatini olish
  const availableSubjects = useMemo(() => {
    const ids = Array.from(new Set(myGrades.map(g => g.subjectId)));
    return state.subjects.filter(s => ids.includes(s.subjectId));
  }, [myGrades, state.subjects]);

  const filteredGrades = useMemo(() => {
    return myGrades.filter(g => {
      const matchSubject = selectedSubject === 'All' || g.subjectId === selectedSubject;
      const subjectName = state.subjects.find(s => s.subjectId === g.subjectId)?.name || '';
      const matchSearch = subjectName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [myGrades, selectedSubject, searchTerm, state.subjects]);

  return (
    <div className="space-y-8 animate-fade pb-20">
      {/* Welcome & Stats */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-[-20%] right-[-5%] w-[30%] h-[150%] bg-blue-600/5 rotate-12 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2 uppercase">Akademik <span className="text-blue-500">Muvaffaqiyat</span></h2>
            <p className="text-slate-400 text-sm font-medium">Barcha fanlardan olgan baholaringiz tahlili</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 text-center min-w-[140px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">O'rtacha Ball</p>
                <p className="text-3xl font-black text-white">
                  {myGrades.length > 0 ? (myGrades.reduce((a, b) => a + b.grade, 0) / myGrades.length).toFixed(1) : '0.0'}
                </p>
             </div>
             <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 text-center min-w-[140px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Baholar Soni</p>
                <p className="text-3xl font-black text-blue-500">{myGrades.length}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Today's Grades Section */}
      {todayGrades.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-3">
             <Activity size={16} className="text-emerald-500" /> Bugungi faollik
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {todayGrades.map(g => (
               <div key={g.id} className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-emerald-500/10 transition-all">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
                      {state.subjects.find(s => s.subjectId === g.subjectId)?.name}
                    </p>
                    <p className="text-sm font-bold text-white">Bugun olindi</p>
                  </div>
                  <div className="text-3xl font-black text-emerald-500">{g.grade}</div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Main Filter & List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
           {/* Sidebar Filter */}
           <div className="bg-[#0f172a] rounded-[2rem] p-6 border border-white/5 shadow-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 px-2">Fanlar bo'yicha</h4>
              <div className="space-y-2">
                 <button 
                   onClick={() => setSelectedSubject('All')}
                   className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold transition-all ${selectedSubject === 'All' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
                 >
                   Barcha fanlar
                 </button>
                 {availableSubjects.map(s => (
                   <button 
                     key={s.id}
                     onClick={() => setSelectedSubject(s.subjectId)}
                     className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold transition-all ${selectedSubject === s.subjectId ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
                   >
                     {s.name}
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-blue-600 p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
              <div className="absolute -right-4 -bottom-4 opacity-20">
                 <Star size={100} className="text-white" />
              </div>
              <h4 className="text-white font-black text-lg mb-2 relative z-10">Muvaffaqiyat!</h4>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-80 relative z-10">
                O'quv ko'rsatkichlaringizni nazorat qiling va natijalarni yaxshilang.
              </p>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* Search & Layout Toggle */}
           <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input 
                   type="text" 
                   placeholder="Baholar tarixidan qidirish..." 
                   className="w-full bg-[#0f172a] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium text-white outline-none focus:border-blue-500 transition-all shadow-xl"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>

           {/* Grades List */}
           <div className="space-y-4">
              {filteredGrades.map(g => (
                <div key={g.id} className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-white/5 hover:border-blue-500/20 transition-all flex items-center justify-between group shadow-xl">
                   <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl border transition-all ${g.grade >= 4 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                        {g.grade}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">
                          {state.subjects.find(s => s.subjectId === g.subjectId)?.name}
                        </h4>
                        <div className="flex items-center gap-4 mt-1">
                           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                             <Calendar size={12} /> {g.date}
                           </span>
                           {g.comment && (
                             <span className="text-[10px] text-blue-500/50 font-bold uppercase tracking-widest flex items-center gap-2 italic">
                               <MessageSquare size={12} /> Izoh mavjud
                             </span>
                           )}
                        </div>
                      </div>
                   </div>
                   <div className="text-right hidden md:block">
                      {g.comment && (
                        <p className="text-[10px] text-slate-500 font-medium italic max-w-[200px] truncate">"{g.comment}"</p>
                      )}
                      <p className="text-[10px] text-slate-600 font-bold mt-2 uppercase tracking-widest">Akademik nazorat</p>
                   </div>
                </div>
              ))}

              {filteredGrades.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center opacity-20 bg-slate-900/40 rounded-[3rem] border border-dashed border-white/5">
                   <ClipboardList size={64} className="mb-4 text-slate-600" />
                   <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-500">Baholar topilmadi</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;
