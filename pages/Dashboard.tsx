
import React, { useMemo } from 'react';
import { AppState, User } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Award, Shield, Cpu, Activity, Zap } from 'lucide-react';

interface DashboardProps {
  state: AppState;
  user?: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ state, user }) => {
  const teacherName = user ? `${user.firstName || ''} ${user.lastName || user.username}` : "Instruktor";
  
  // O'qituvchiga tegishli o'quvchilarni filtrlaymiz
  const relevantStudents = useMemo(() => {
    if (user?.role === 'TEACHER') {
      const assigned = user.assignedGrades || [];
      return state.students.filter(s => assigned.includes(s.grade));
    }
    return state.students;
  }, [state.students, user]);

  const relevantGrades = useMemo(() => {
    const studentIds = new Set(relevantStudents.map(s => s.id));
    return state.dailyGrades.filter(g => studentIds.has(g.studentId));
  }, [state.dailyGrades, relevantStudents]);

  const totalStudents = relevantStudents.length;
  
  const averageGrade = useMemo(() => {
    if (relevantGrades.length === 0) return 0;
    const sum = relevantGrades.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / relevantGrades.length).toFixed(1);
  }, [relevantGrades]);

  const todayAttendance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const studentIds = new Set(relevantStudents.map(s => s.id));
    const todayRecords = state.attendance.filter(a => a.date === today && studentIds.has(a.studentId));
    
    if (todayRecords.length === 0) return '0%';
    const present = todayRecords.filter(r => r.status === 'present').length;
    return `${Math.round((present / todayRecords.length) * 100)}%`;
  }, [state.attendance, relevantStudents]);

  const stats = [
    { label: user?.role === 'TEACHER' ? 'Mening O\'quvchilarim' : 'Jami O\'quvchilar', value: totalStudents, icon: <Users size={24} />, color: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/20' },
    { label: 'O\'rtacha Reyting', value: averageGrade, icon: <TrendingUp size={24} />, color: 'from-purple-500 to-indigo-600', glow: 'shadow-purple-500/20' },
    { label: 'Bugungi Davomat', value: todayAttendance, icon: <Zap size={24} />, color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
    { label: 'Sertifikatlar', value: state.exams.length, icon: <Award size={24} />, color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Welcome */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
        <div className="relative glass-card rounded-[2.5rem] p-8 md:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Activity size={240} className="text-cyan-400" />
          </div>
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Shield size={14} /> XODIM PLATFORMASI V 3.1.0
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
              Xush kelibsiz, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{teacherName}</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              {user?.role === 'TEACHER' 
                ? `Bugun sizga biriktirilgan ${user.assignedGrades?.join(', ')} sinflarida darslar rejalashtirilgan. Tizim orqali davomat va baholarni nazorat qilishingiz mumkin.`
                : "Tizim to'liq nazorat rejimida. Barcha akademik va moliyaviy o'zgarishlar audit loglariga yozib borilmoqda."}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 rounded-[2rem] hover:translate-y-[-4px] transition-all duration-300 group relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white ${stat.glow} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              </div>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${stat.color} w-2/3`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">O'zlashtirish Dinamikasi</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Sizga biriktirilgan guruhlar auditi</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Dush', g: 3.8 }, { name: 'Sesh', g: 4.2 }, { name: 'Chor', g: 4.0 }, 
                { name: 'Pay', g: 4.8 }, { name: 'Jum', g: 4.5 }, { name: 'Shan', g: 4.9 }
              ]}>
                <defs>
                  <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 800}} />
                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 800}} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', color: '#fff' }} 
                  itemStyle={{ fontWeight: '900', color: '#22d3ee' }}
                />
                <Area type="monotone" dataKey="g" stroke="#22d3ee" strokeWidth={5} fillOpacity={1} fill="url(#cyberGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Logs */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-8 rounded-[2.5rem] flex-1">
            <div className="bg-cyan-500/10 w-fit p-4 rounded-2xl mb-6 border border-cyan-500/20">
              <Cpu size={28} className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-6">Tizim Bildirishnomalari</h3>
            <div className="space-y-6">
              {[
                { time: 'Hozir', msg: 'Tizim barqaror ishlamoqda', type: 'info' },
                { time: 'Bugun', msg: 'Davomat protokollari yangilandi', type: 'success' },
                { time: 'Kecha', msg: 'Xavfsizlik sertifikati tasdiqlandi', type: 'info' }
              ].map((log, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="text-[10px] font-black text-slate-600 mono pt-1">{log.time}</div>
                  <div className="flex-1 text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{log.msg}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <Zap size={120} className="text-white" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">Tezkor Vazifa</h4>
            <p className="text-indigo-100 text-xs font-medium mb-6 opacity-80">Bugun barcha o'quvchilarning choraklik baholarini yakunlang.</p>
            <button className="w-full py-3 bg-white text-indigo-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Auditni Tekshirish</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
