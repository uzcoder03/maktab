
import React, { useState, useMemo, useEffect } from 'react';
import { Student, Attendance, DailyGrade, User } from '../types';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Users, 
  Fingerprint, 
  ShieldCheck, 
  Activity,
  Search,
  Edit3,
  Save,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface ClubProps {
  students: Student[];
  clubMemberships: any[];
  clubAttendance: Attendance[];
  clubGrades: DailyGrade[];
  clubName: string;
  setClubAttendance: (data: any[]) => Promise<void>;
  setClubGrades: (data: any[]) => Promise<void>;
  toggleMember: (studentId: string, isMember: boolean) => Promise<void>;
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempClubName, setTempClubName] = useState(clubName);
  
  // Davomat uchun vaqtinchalik state (izohlar bilan)
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, { status: 'present' | 'absent', comment: string }>>({});

  // To'garak a'zolari
  const myClubMembers = useMemo(() => {
    const memberIds = clubMemberships
      .filter(m => m.teacherId === user?.id)
      .map(m => m.studentId);
    return students.filter(s => memberIds.includes(s.studentId));
  }, [students, clubMemberships, user]);

  // Draftni yuklash
  useEffect(() => {
    const draft: Record<string, { status: 'present' | 'absent', comment: string }> = {};
    myClubMembers.forEach(m => {
      const existing = clubAttendance.find(a => a.studentId === m.id && a.date === selectedDate);
      draft[m.id] = {
        status: (existing?.status as 'present' | 'absent') || 'present',
        comment: existing?.comment || ''
      };
    });
    setAttendanceDraft(draft);
  }, [selectedDate, myClubMembers, clubAttendance]);

  const handleSaveClubName = () => {
    updateClubName(tempClubName);
    setIsEditingName(false);
  };

  const handleUpdateAttendance = (studentId: string, status: 'present' | 'absent', comment?: string) => {
    setAttendanceDraft(prev => ({
      ...prev,
      [studentId]: { 
        status, 
        comment: comment !== undefined ? comment : prev[studentId]?.comment || '' 
      }
    }));
  };

  const submitAttendance = async () => {
    const payload = myClubMembers.map(m => ({
      studentId: m.id,
      date: selectedDate,
      status: attendanceDraft[m.id]?.status || 'present',
      comment: attendanceDraft[m.id]?.comment || '',
      subjectId: clubName, // To'garak nomi fan sifatida ketadi
      teacherId: user?.id
    }));

    // Kelmaganlar uchun izoh tekshiruvi
    const missingComments = payload.filter(p => p.status === 'absent' && !p.comment.trim());
    if (missingComments.length > 0) {
      alert("Diqqat! Kelmagan o'quvchilar uchun sababni (izohni) yozish majburiy.");
      return;
    }

    try {
      await setClubAttendance(payload);
      alert("Davomat saqlandi va o'quv bo'limiga yuborildi!");
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };

  const clubTitle = clubName || user?.specialization || "Mening To'garagim";

  return (
    <div className="space-y-8 animate-fade pb-20 mono">
      {/* Header with Title Edit */}
      <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Fingerprint size={180} className="text-cyan-500" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">Instruktor: {user?.firstName} {user?.lastName}</span>
            </div>
            
            {isEditingName ? (
              <div className="flex items-center gap-4 max-w-xl">
                <input 
                  className="bg-slate-950 border border-cyan-500/30 rounded-2xl px-6 py-3 text-3xl font-black text-white outline-none w-full italic"
                  value={tempClubName}
                  onChange={(e) => setTempClubName(e.target.value)}
                  placeholder="To'garak nomini kiriting..."
                />
                <button onClick={handleSaveClubName} className="p-4 bg-emerald-500 text-black rounded-2xl hover:bg-emerald-400 transition-all"><Save size={24}/></button>
              </div>
            ) : (
              <div className="flex items-center gap-6 group">
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">{clubTitle}</h2>
                <button onClick={() => setIsEditingName(true)} className="p-3 bg-white/5 rounded-xl text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:text-cyan-400">
                  <Edit3 size={20} />
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Shaxsiy to'garak monitoringi va boshqaruvi</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-950/50 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">A'zolar Soni</p>
                <p className="text-4xl font-black text-white">{myClubMembers.length}</p>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <Users size={28} />
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/50 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
          {[
            { id: 'members', label: 'A\'zolar', icon: <Users size={14}/> },
            { id: 'attendance', label: 'Davomat', icon: <Calendar size={14}/> },
            { id: 'grades', label: 'Reyting', icon: <Activity size={14}/> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${activeSubTab === tab.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-white">
           <Calendar size={18} className="text-cyan-500" />
           <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent font-black text-sm outline-none cursor-pointer uppercase" />
        </div>
      </div>

      {/* Members Section */}
      {activeSubTab === 'members' && (
        <div className="space-y-8 animate-fade">
          <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-white/5 relative group">
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-3 italic">
               <Plus size={16} className="text-cyan-500" /> YANGI_A'ZO_QO'SHISH
            </h4>
            <div className="flex gap-4 relative z-10">
                <div className="relative flex-1">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                   <input 
                    type="text" placeholder="ID BO'YICHA QIDIRISH (S1001)..." 
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white font-black outline-none focus:border-cyan-500/40 uppercase text-sm tracking-widest" 
                    value={searchId} onChange={(e) => setSearchId(e.target.value)} 
                  />
                </div>
                <button 
                  onClick={async () => { await toggleMember(searchId, true); setSearchId(''); }} 
                  className="px-12 bg-cyan-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-2xl hover:bg-cyan-500 transition-all active:scale-95"
                >DATABASE_COMMIT</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClubMembers.map(member => (
              <div key={member.id} className="bg-[#0f172a] p-8 rounded-[3rem] border border-white/5 flex items-center justify-between group hover:border-cyan-500/30 transition-all shadow-xl">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center text-cyan-400 font-black text-xl italic">
                      {member.firstName[0]}
                   </div>
                   <div>
                      <h5 className="text-white font-black text-lg tracking-tight uppercase italic">{member.firstName} {member.lastName}</h5>
                      <p className="text-[10px] text-slate-600 font-bold uppercase mono tracking-widest">{member.studentId}</p>
                   </div>
                </div>
                <button onClick={() => toggleMember(member.studentId, false)} className="p-4 text-slate-700 hover:text-rose-500 transition-colors bg-white/5 rounded-2xl hover:bg-rose-500/10">
                  <Trash2 size={20}/>
                </button>
              </div>
            ))}
            {myClubMembers.length === 0 && (
              <div className="col-span-full py-24 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/5 rounded-[4rem]">
                <Users size={64} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.5em]">Hozircha a'zolar yo'q</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance Section */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-8 animate-fade">
          <div className="bg-[#0f172a] rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-cyan-500/5">
               <div>
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tight">KUNLIK_DAVOMAT</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Kelmaganlar uchun izoh yozish majburiy!</p>
               </div>
               <button 
                 onClick={submitAttendance}
                 className="px-10 py-5 bg-cyan-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-cyan-500 shadow-xl transition-all active:scale-95 flex items-center gap-3"
               >
                 <Save size={18} /> SYNC_TO_ADMIN
               </button>
            </div>
            
            <div className="p-8 space-y-4">
              {myClubMembers.map(member => {
                const draft = attendanceDraft[member.id] || { status: 'present', comment: '' };
                const isAbsent = draft.status === 'absent';
                
                return (
                  <div key={member.id} className={`p-8 rounded-[2.5rem] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${isAbsent ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-950 border-white/5'}`}>
                    <div className="flex items-center gap-6 min-w-[250px]">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl italic border ${isAbsent ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
                          {member.firstName[0]}
                       </div>
                       <div>
                          <h5 className="text-white font-black text-lg tracking-tight uppercase italic">{member.firstName} {member.lastName}</h5>
                          <p className="text-[9px] text-slate-600 font-bold uppercase mono tracking-[0.2em]">{member.studentId}</p>
                       </div>
                    </div>

                    <div className="flex flex-1 flex-col md:flex-row items-center gap-6">
                       <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
                          <button 
                            onClick={() => handleUpdateAttendance(member.id, 'present')}
                            className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${draft.status === 'present' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-600 hover:text-white'}`}
                          >
                            <CheckCircle2 size={14} /> Keldi
                          </button>
                          <button 
                            onClick={() => handleUpdateAttendance(member.id, 'absent')}
                            className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${draft.status === 'absent' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}
                          >
                            <XCircle size={14} /> Yo'q
                          </button>
                       </div>

                       {isAbsent && (
                         <div className="flex-1 w-full animate-fade">
                            <div className="relative">
                               <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/50" size={16} />
                               <input 
                                 placeholder="Nima uchun kelmadi? (O'quv bo'limi ko'radi)..."
                                 className="w-full bg-slate-900 border border-rose-500/30 rounded-2xl pl-12 pr-4 py-4 text-[10px] text-white font-black uppercase italic outline-none focus:border-rose-500"
                                 value={draft.comment}
                                 onChange={(e) => handleUpdateAttendance(member.id, 'absent', e.target.value)}
                               />
                            </div>
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}

              {myClubMembers.length === 0 && (
                <div className="py-20 text-center opacity-20">
                   <AlertCircle size={48} className="mx-auto mb-4" />
                   <p className="text-xs font-black uppercase tracking-widest">A'zolar mavjud emas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grades Section */}
      {activeSubTab === 'grades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade">
          {myClubMembers.map(member => {
            const att = clubAttendance.find(a => a.studentId === member.id && a.date === selectedDate);
            const gr = clubGrades.find(g => g.studentId === member.id && g.date === selectedDate);
            const isAbsent = att?.status === 'absent';
            
            return (
              <div key={member.id} className={`bg-[#0f172a] p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden transition-all shadow-xl group ${isAbsent ? 'opacity-30 grayscale' : 'hover:border-cyan-500/30'}`}>
                 <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-cyan-400 border border-white/5 italic text-xl">
                       {member.firstName[0]}
                    </div>
                    <div>
                       <h5 className="text-white font-black text-xl tracking-tighter uppercase italic">{member.firstName}</h5>
                       <p className="text-[10px] text-slate-600 font-bold mono uppercase tracking-widest">{member.studentId}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-5 gap-3">
                    {[1,2,3,4,5].map(n => (
                      <button 
                        key={n} disabled={isAbsent}
                        onClick={async () => { await setClubGrades([{ studentId: member.id, date: selectedDate, grade: n, subjectId: clubTitle }]); }}
                        className={`aspect-square rounded-2xl font-black text-2xl border-2 transition-all flex items-center justify-center ${gr?.grade === n ? 'bg-cyan-500 text-black border-cyan-400 shadow-xl' : 'bg-slate-950 text-slate-700 border-white/5 hover:border-white/20'}`}
                      >{n}</button>
                    ))}
                 </div>

                 {isAbsent && (
                   <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                      <XCircle size={40} className="text-rose-500 mb-4" />
                      <span className="text-white font-black text-[10px] uppercase tracking-widest leading-relaxed">BU O'QUVCHI TO'GARAKDA ISHTIROK ETMADI</span>
                   </div>
                 )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClubPage;
