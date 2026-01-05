
import React, { useState, useMemo } from 'react';
import { Student, Attendance, DailyGrade, User } from '../types';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Users, 
  Fingerprint, 
  Lock, 
  ShieldCheck, 
  Activity,
  Search
} from 'lucide-react';

// Fix: Added missing clubName and updateClubName properties to ClubProps interface to resolve TS errors in App.tsx
interface ClubProps {
  students: Student[];
  clubMemberships: any[];
  clubAttendance: Attendance[];
  clubGrades: DailyGrade[];
  clubName: string;
  setClubAttendance: (data: any[]) => void;
  setClubGrades: (data: any[]) => void;
  toggleMember: (studentId: string, isMember: boolean) => void;
  updateClubName: (name: string) => void;
  user?: User | null;
}

const ClubPage: React.FC<ClubProps> = ({ 
  students, clubMemberships, clubAttendance, clubGrades, 
  setClubAttendance, setClubGrades, toggleMember, user,
  clubName, updateClubName
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'attendance' | 'grades'>('members');
  const [searchId, setSearchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Faqat joriy o'qituvchining (specialization) to'garak a'zolarini filtrlaymiz
  const myClubMembers = useMemo(() => {
    const memberIds = clubMemberships
      .filter(m => m.teacherId === user?.id)
      .map(m => m.studentId);
    return students.filter(s => memberIds.includes(s.studentId));
  }, [students, clubMemberships, user]);

  // Fix: Prioritize clubName from props for the title
  const clubTitle = clubName || user?.specialization || "Mening To'garagim";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="glass-card p-10 rounded-[3rem] border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Fingerprint size={180} className="text-cyan-500" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">Instruktor: {user?.firstName} {user?.lastName}</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{clubTitle}</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Shaxsiy to'garak monitoringi va boshqaruvi</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">To'garak A'zolari</p>
                <p className="text-4xl font-black text-white">{myClubMembers.length}</p>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <Users size={28} />
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/50 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
          {['members', 'attendance', 'grades'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab as any)}
              className={`px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {tab === 'members' ? 'A\'zolar' : tab === 'attendance' ? 'Davomat' : 'Reyting'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-white">
           <Calendar size={20} className="text-cyan-500" />
           <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent font-black text-sm outline-none cursor-pointer uppercase" />
        </div>
      </div>

      {activeSubTab === 'members' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="glass-card p-10 rounded-[3rem] border-white/5 relative group">
            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-6 flex items-center gap-3">
               <Plus size={18} className="text-cyan-500" /> Yangi A'zo Qo'shish
            </h4>
            <div className="flex gap-4 relative z-10">
                <div className="relative flex-1">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                   <input 
                    type="text" placeholder="O'QUVCHI_ID (S1001)..." 
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white font-black outline-none focus:border-cyan-500/40 uppercase" 
                    value={searchId} onChange={(e) => setSearchId(e.target.value)} 
                  />
                </div>
                <button 
                  onClick={() => { toggleMember(searchId, true); setSearchId(''); }} 
                  className="px-12 bg-cyan-500 text-black font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >A'ZO QILISH</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClubMembers.map(member => (
              <div key={member.id} className="glass-card p-8 rounded-[3rem] border-white/5 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center text-cyan-400 font-black text-xl">
                      {member.firstName[0]}
                   </div>
                   <div>
                      <h5 className="text-white font-black text-lg tracking-tight">{member.firstName} {member.lastName}</h5>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">{member.studentId}</p>
                   </div>
                </div>
                <button onClick={() => toggleMember(member.studentId, false)} className="p-4 text-slate-700 hover:text-rose-500 transition-colors bg-white/5 rounded-2xl hover:bg-rose-500/10">
                  <Trash2 size={20}/>
                </button>
              </div>
            ))}
            {myClubMembers.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20">
                <Users size={64} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.5em]">Hozircha a'zolar yo'q</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance & Grades UI remains consistent, but filters are pre-applied to myClubMembers */}
      {(activeSubTab === 'attendance' || activeSubTab === 'grades') && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
           {activeSubTab === 'attendance' ? (
             <div className="glass-card rounded-[3.5rem] overflow-hidden border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-12 py-8">Agent / O'quvchi</th>
                      <th className="px-12 py-8 text-center">Ishtirok Statusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myClubMembers.map(member => {
                      const record = clubAttendance.find(a => a.studentId === member.id && a.date === selectedDate);
                      return (
                        <tr key={member.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-12 py-8">
                             <div className="flex flex-col">
                                <span className="text-white font-black text-lg">{member.firstName} {member.lastName}</span>
                                <span className="text-[10px] text-slate-600 font-bold mono">{member.studentId}</span>
                             </div>
                          </td>
                          <td className="px-12 py-8">
                            <div className="flex justify-center gap-4">
                              <button onClick={() => setClubAttendance([{ studentId: member.id, date: selectedDate, status: 'present', subjectId: clubTitle }])} className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${record?.status === 'present' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-950 text-slate-600 border border-white/5'}`}>Keldi</button>
                              <button onClick={() => setClubAttendance([{ studentId: member.id, date: selectedDate, status: 'absent', subjectId: clubTitle }])} className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${record?.status === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-950 text-slate-600 border border-white/5'}`}>Yo'q</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myClubMembers.map(member => {
                  const att = clubAttendance.find(a => a.studentId === member.id && a.date === selectedDate);
                  const gr = clubGrades.find(g => g.studentId === member.id && g.date === selectedDate);
                  const isAbsent = att?.status === 'absent';
                  return (
                    <div key={member.id} className={`glass-card p-10 rounded-[3.5rem] relative overflow-hidden transition-all ${isAbsent ? 'opacity-30 grayscale' : 'hover:border-cyan-500/30'}`}>
                       <div className="flex items-center gap-4 mb-8">
                          <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-cyan-400 border border-white/5">
                             {member.firstName[0]}
                          </div>
                          <div>
                             <h5 className="text-white font-black text-xl tracking-tighter">{member.firstName}</h5>
                             <p className="text-[10px] text-slate-600 font-bold mono uppercase">{member.studentId}</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-5 gap-2">
                          {[1,2,3,4,5].map(n => (
                            <button 
                              key={n} disabled={isAbsent}
                              onClick={() => setClubGrades([{ studentId: member.id, date: selectedDate, grade: n, subjectId: clubTitle }])}
                              className={`aspect-square rounded-2xl font-black text-xl border-2 transition-all ${gr?.grade === n ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-slate-950 text-slate-600 border-white/5'}`}
                            >{n}</button>
                          ))}
                       </div>
                       {isAbsent && (
                         <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-rose-500 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl">Darsda Yo'q</span>
                         </div>
                       )}
                    </div>
                  );
                })}
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ClubPage;
