
import React, { useState, useMemo } from 'react';
import { Student, Attendance, DailyGrade, User } from '../types';
import { Search, Plus, Trash2, Calendar, Star, Shield, Users, Fingerprint, Activity, ShieldCheck, Lock, UserX } from 'lucide-react';

interface ClubProps {
  students: Student[];
  clubMemberships: any[];
  clubAttendance: Attendance[];
  clubGrades: DailyGrade[];
  setClubAttendance: (data: any[]) => void;
  setClubGrades: (data: any[]) => void;
  toggleMember: (studentId: string, isMember: boolean) => void;
  clubName: string;
  updateClubName: (name: string) => void;
  user?: User | null;
}

const ClubPage: React.FC<ClubProps> = ({ 
  students, clubMemberships, clubAttendance, clubGrades, 
  setClubAttendance, setClubGrades, toggleMember, user 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'attendance' | 'grades'>('members');
  const [searchId, setSearchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Faqat joriy o'qituvchiga tegishli to'garak a'zolarini filtrlaymiz
  const myClubMembers = useMemo(() => {
    const memberIds = clubMemberships
      .filter(m => m.teacherId === user?.id)
      .map(m => m.studentId);
    return students.filter(s => memberIds.includes(s.studentId));
  }, [students, clubMemberships, user]);

  const clubTitle = user?.specialization || "Mening To'garagim";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Hero Header */}
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
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{clubTitle}</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">To'garak a'zolari va natijalarini boshqarish</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jami A'zolar</p>
                <p className="text-3xl font-black text-white">{myClubMembers.length}</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <Users size={24} />
             </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 p-1.5 bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/5">
          {['members', 'attendance', 'grades'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab as any)}
              className={`px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              {tab === 'members' ? 'A\'zolar' : tab === 'attendance' ? 'Davomat' : 'Reyting'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-white">
           <Calendar size={18} className="text-cyan-500" />
           <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent font-black text-sm outline-none cursor-pointer uppercase" />
        </div>
      </div>

      {activeSubTab === 'members' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="glass-card p-10 rounded-[3rem] border-white/5">
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
               <Plus size={16} className="text-cyan-500" /> Yangi Agent Qo'shish
            </h4>
            <div className="flex gap-4">
                <input 
                  type="text" placeholder="AGENT_ID (Masalan: S1001)..." 
                  className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500/40" 
                  value={searchId} onChange={(e) => setSearchId(e.target.value)} 
                />
                <button 
                  onClick={() => { toggleMember(searchId, true); setSearchId(''); }} 
                  className="px-10 bg-cyan-500 text-black font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl"
                >Qo'shish</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClubMembers.map(member => (
              <div key={member.id} className="glass-card p-8 rounded-[2.5rem] border-white/5 flex items-center justify-between group">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center text-cyan-400 font-black">
                      {member.firstName[0]}
                   </div>
                   <div>
                      <h5 className="text-white font-bold text-lg">{member.firstName} {member.lastName}</h5>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mono">{member.studentId}</p>
                   </div>
                </div>
                <button onClick={() => toggleMember(member.studentId, false)} className="p-3 text-slate-700 hover:text-rose-500 transition-colors">
                  <Trash2 size={20}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'attendance' && (
        <div className="glass-card rounded-[3.5rem] overflow-hidden border-white/5 animate-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-10 py-6">Agent</th>
                <th className="px-10 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myClubMembers.map(member => {
                const record = clubAttendance.find(a => a.studentId === member.id && a.date === selectedDate);
                return (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-10 py-6">
                      <span className="text-white font-bold">{member.firstName} {member.lastName}</span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => setClubAttendance([{ studentId: member.id, date: selectedDate, status: 'present', subjectId: clubTitle }])} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${record?.status === 'present' ? 'bg-emerald-500 text-black' : 'bg-slate-950 text-slate-500'}`}>Keldi</button>
                        <button onClick={() => setClubAttendance([{ studentId: member.id, date: selectedDate, status: 'absent', subjectId: clubTitle }])} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${record?.status === 'absent' ? 'bg-rose-500 text-white' : 'bg-slate-950 text-slate-500'}`}>Yo'q</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'grades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          {myClubMembers.map(member => {
            const att = clubAttendance.find(a => a.studentId === member.id && a.date === selectedDate);
            const gr = clubGrades.find(g => g.studentId === member.id && g.date === selectedDate);
            const isAbsent = att?.status === 'absent';
            return (
              <div key={member.id} className={`glass-card p-10 rounded-[3rem] ${isAbsent ? 'opacity-40 grayscale' : ''}`}>
                 <h5 className="text-white font-black text-xl mb-6">{member.firstName}</h5>
                 <div className="flex justify-between gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button 
                        key={n} disabled={isAbsent}
                        onClick={() => setClubGrades([{ studentId: member.id, date: selectedDate, grade: n, subjectId: clubTitle }])}
                        className={`flex-1 aspect-square rounded-2xl font-black text-xl border-2 transition-all ${gr?.grade === n ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-950 text-slate-600 border-white/5'}`}
                      >{n}</button>
                    ))}
                 </div>
                 {isAbsent && <p className="text-[10px] text-rose-500 font-black uppercase text-center mt-4">Offline</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClubPage;
