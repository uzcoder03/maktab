
import React, { useMemo } from 'react';
import { AppState, User, Student, DailyGrade, Exam } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, TrendingUp, ShieldCheck, Activity, Cpu, Radar, Clock, Bell, UserCheck, 
  LayoutGrid, Star, GraduationCap, Calendar, Zap, Fingerprint, Terminal, ShieldAlert,
  ChevronRight, Bookmark
} from 'lucide-react';

interface DashboardProps {
  state: AppState;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ state, user }) => {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
  const isStudent = user.role === 'STUDENT';

  // --- STUDENT SPECIFIC DATA ---
  const studentData = useMemo(() => {
    if (!isStudent) return null;
    const myGrades = state.dailyGrades.filter(g => g.studentId === user.id);
    const myExams = state.exams.filter(e => e.studentId === user.id);
    const myAttendance = state.attendance.filter(a => a.studentId === user.id);
    const today = new Date().toISOString().split('T')[0];
    const todayGrades = myGrades.filter(g => g.date === today);

    const gpa = myGrades.length > 0 
      ? (myGrades.reduce((a, b) => a + b.grade, 0) / myGrades.length).toFixed(1) 
      : '0.0';

    return { myGrades, myExams, myAttendance, todayGrades, gpa };
  }, [state, user, isStudent]);

  // --- STAFF SPECIFIC DATA ---
  const staffStats = useMemo(() => {
    if (isStudent) return null;
    return [
      { label: 'O\'quvchilar', value: state.students.length, icon: <Users size={20} />, color: '#3b82f6', desc: 'Jami faol tugunlar' },
      { label: 'Sinflar', value: state.classes.length, icon: <LayoutGrid size={20} />, color: '#6366f1', desc: 'Barcha sektorlar' },
      { label: 'Fanlar', value: state.subjects.length, icon: <Activity size={20} />, color: '#10b981', desc: 'Akademik yo\'nalish' },
      { label: 'Testlar', value: state.tests.length, icon: <ShieldAlert size={20} />, color: '#f59e0b', desc: 'Imtihon modullari' },
    ];
  }, [state, isStudent]);

  const chartData = useMemo(() => {
    if (isStudent && studentData) {
      return studentData.myGrades.slice(-7).map(g => ({ n: g.date.split('-').slice(1).join('/'), v: g.grade }));
    }
    return [{n:'Dush',v:45},{n:'Sesh',v:52},{n:'Chor',v:48},{n:'Pay',v:70},{n:'Jum',v:65},{n:'Shan',v:40}];
  }, [isStudent, studentData]);

  return (
    <div className="space-y-8 animate-fade pb-20 mono">
      {/* Identity Header Card */}
      <div className="bg-[#0f172a] rounded-[3rem] p-10 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Fingerprint size={220} className="text-blue-500" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
           <div className="flex items-center gap-8">
              <div className="relative group">
                 <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/40 transition-all"></div>
                 <div className="w-24 h-24 rounded-[2rem] bg-slate-950 border border-white/10 flex items-center justify-center text-blue-500 shadow-2xl relative z-10">
                    {isStudent ? <GraduationCap size={44} /> : <ShieldCheck size={44} />}
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{fullName}</h1>
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-black text-blue-500 uppercase tracking-widest">Verified</span>
                 </div>
                 <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                       <Zap size={14} className="text-amber-500" /> Lavozim: {user.role}
                    </div>
                    {isStudent && (
                       <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                          <Bookmark size={14} className="text-blue-500" /> Sinf: {user.grade}
                       </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                       <Terminal size={14} className="text-cyan-500" /> ID: {user.id.slice(-6).toUpperCase()}
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-6 bg-slate-950/50 p-6 rounded-[2.5rem] border border-white/5">
              <Clock size={28} className="text-blue-500" />
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tizim Vaqti</p>
                 <p className="text-2xl font-black text-white italic">
                   {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Statistics Grid */}
      {isStudent ? (
        /* O'quvchi uchun statistikalar */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">O'rtacha Ball (GPA)</p>
              <div className="flex items-end gap-3">
                 <p className="text-5xl font-black text-white italic">{studentData?.gpa}</p>
                 <span className="text-emerald-500 font-bold text-xs mb-2">MAX: 5.0</span>
              </div>
           </div>
           <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Bugungi Baholar</p>
              <div className="flex items-end gap-3">
                 <p className="text-5xl font-black text-blue-500 italic">{studentData?.todayGrades.length}</p>
                 <span className="text-slate-600 font-bold text-xs mb-2 italic">FAN_AKTIVLIGI</span>
              </div>
           </div>
           <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Topshirilgan Imtihonlar</p>
              <div className="flex items-end gap-3">
                 <p className="text-5xl font-black text-indigo-500 italic">{studentData?.myExams.length}</p>
                 <span className="text-slate-600 font-bold text-xs mb-2 italic">TOTAL_EXAMS</span>
              </div>
           </div>
           <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Davomat Darajasi</p>
              <div className="flex items-end gap-3">
                 <p className="text-5xl font-black text-emerald-500 italic">
                    {studentData?.myAttendance.length > 0 
                      ? Math.round((studentData.myAttendance.filter(a => a.status === 'present').length / studentData.myAttendance.length) * 100) 
                      : 0}%
                 </p>
                 <span className="text-slate-600 font-bold text-xs mb-2 italic">PRESENCE</span>
              </div>
           </div>
        </div>
      ) : (
        /* Xodimlar uchun statistikalar */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {staffStats?.map((s, i) => (
             <div key={i} className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all shadow-xl group">
               <div className="flex items-center justify-between mb-8">
                 <div className="p-4 rounded-2xl bg-white/5 text-blue-500 border border-white/5 group-hover:scale-110 transition-transform">
                   {s.icon}
                 </div>
                 <Activity size={14} className="text-slate-800" />
               </div>
               <h4 className="text-4xl font-black text-white mb-1 tracking-tight italic">{s.value}</h4>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
               <p className="text-[8px] font-bold text-slate-700 mt-2 italic">PROTOCOL: {s.desc.toUpperCase()}</p>
             </div>
           ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Academic Activity Chart */}
        <div className="lg:col-span-2 bg-[#0f172a] rounded-[3rem] p-10 border border-white/5 shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <Radar size={150} className="text-blue-500" />
           </div>
           <div className="flex justify-between items-center mb-12 relative z-10">
              <div>
                 <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-3">
                    <TrendingUp size={20} className="text-blue-500" /> Akademik Faollik_Grafiki
                 </h3>
                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Oxirgi topshirilgan natijalar tahlili</p>
              </div>
           </div>
           <div className="h-[350px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="n" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={15} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Right Section: Student Grades or System Logs */}
        <div className="bg-[#0f172a] rounded-[3rem] p-10 border border-white/5 shadow-2xl flex flex-col">
           <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3 italic uppercase">
              {isStudent ? <Star size={20} className="text-blue-500" /> : <Bell size={20} className="text-blue-500" />}
              {isStudent ? 'Bugungi_Natijalar' : 'Tizim_Loglari'}
           </h3>
           
           <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {isStudent ? (
                /* O'quvchining bugungi baholari */
                studentData?.todayGrades.length ? studentData.todayGrades.map((g, i) => (
                  <div key={i} className="p-5 bg-slate-950/50 border border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all">
                     <div className="flex justify-between items-center mb-1">
                        <div>
                           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">
                              {state.subjects.find(s => s.subjectId === g.subjectId)?.name || 'Noma\'lum fan'}
                           </p>
                           <p className="text-xs font-bold text-white mt-1">Kunlik baholash</p>
                        </div>
                        <div className="text-2xl font-black text-white italic">{g.grade}</div>
                     </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                     <Activity size={48} className="mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-center">Bugun baholar kiritilmadi</p>
                  </div>
                )
              ) : (
                /* Xodimlar uchun loglar */
                [
                  { t: 'Davomat audit yakunlandi', time: '10:12', type: 'info', icon: <UserCheck size={14}/> },
                  { t: 'Yangi test moduli yaratildi', time: '09:45', type: 'success', icon: <Zap size={14}/> },
                  { t: 'Firewall yangilanishi', time: 'Kecha', type: 'system', icon: <ShieldCheck size={14}/> },
                  { t: 'Yangi xodim qo\'shildi', time: '2 kun oldin', type: 'access', icon: <Users size={14}/> },
                ].map((l, i) => (
                  <div key={i} className="p-5 bg-slate-950/50 border border-white/5 rounded-3xl hover:bg-blue-500/5 transition-all group cursor-pointer">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                           <div className="text-blue-500">{l.icon}</div>
                           <span className="text-[11px] font-black text-slate-300 group-hover:text-blue-400 transition-colors uppercase italic">{l.t}</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-700 mono">{l.time}</span>
                     </div>
                     <div className="text-[8px] font-black text-blue-500/30 uppercase tracking-[0.2em] italic pl-7">{l.type}_ENCRYPTED</div>
                  </div>
                ))
              )}
           </div>

           <button className="mt-10 w-full py-5 bg-white/5 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 italic">
              Barcha_Ma'lumotlar <ChevronRight size={14} />
           </button>
        </div>
      </div>

      {/* Footer System Status (Mini Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Security', value: 'ACTIVE', color: 'emerald' },
           { label: 'Network', value: 'SECURE', color: 'blue' },
           { label: 'Database', value: 'SYNCED', color: 'cyan' },
           { label: 'Latency', value: '12ms', color: 'indigo' }
         ].map((item, i) => (
           <div key={i} className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
              <span className={`text-[9px] font-black text-${item.color}-500 uppercase italic`}>{item.value}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Dashboard;
