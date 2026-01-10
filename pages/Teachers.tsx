
import React, { useState } from 'react';
import { User, Subject } from '../types';
import { Plus, Trash2, Shield, Phone, BookOpen, Fingerprint, Layers, X, Briefcase, UserCheck, Loader2 } from 'lucide-react';

interface TeachersPageProps {
  teachers: User[];
  subjects: Subject[];
  classes: string[];
  onAdd: (t: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const TeachersPage: React.FC<TeachersPageProps> = ({ teachers, subjects, classes, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '', password: '', firstName: '', lastName: '', specialization: '', phone: '', assignedGrades: [] as string[], role: 'TEACHER' as 'TEACHER' | 'ACADEMIC'
  });

  const toggleGrade = (grade: string) => {
    setFormData(prev => ({
      ...prev,
      assignedGrades: prev.assignedGrades.includes(grade)
        ? prev.assignedGrades.filter(g => g !== grade)
        : [...prev.assignedGrades, grade]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.assignedGrades.length === 0) { alert("Sinf tanlang!"); return; }
    setSubmitting(true);
    try { await onAdd(formData); setIsModalOpen(false); setFormData({ username: '', password: '', firstName: '', lastName: '', specialization: '', phone: '', assignedGrades: [], role: 'TEACHER' }); } catch (err) { alert("Xatolik!"); } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="glass-card p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 border-cyan-500/20">
        <div><h2 className="text-3xl font-black text-white tracking-tighter">Xodimlar <span className="text-cyan-400">Boshqaruvi</span></h2></div>
        <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-cyan-500 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs flex items-center gap-3"><Plus size={18} strokeWidth={3} /> Qo'shish</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachers.map(teacher => (<div key={teacher.id} className={`glass-card p-8 rounded-[3rem] group hover:border-cyan-500/50 relative overflow-hidden transition-all`}><div className="flex items-center gap-5 mb-8"><div className={`w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl ${teacher.role === 'ACADEMIC' ? 'text-amber-400' : 'text-cyan-400'}`}>{teacher.role === 'ACADEMIC' ? <Briefcase size={32} /> : <Fingerprint size={32} />}</div><div><h4 className="font-black text-white text-xl tracking-tight">{teacher.firstName} {teacher.lastName}</h4><p className={`text-[10px] font-black uppercase tracking-widest mono ${teacher.role === 'ACADEMIC' ? 'text-amber-500' : 'text-cyan-500'}`}>{teacher.role} | @{teacher.username}</p></div></div><div className="space-y-4 mb-8"><div className="flex items-center gap-3 text-slate-400 text-sm font-medium"><span>{teacher.role === 'TEACHER' ? (subjects.find(s => s.subjectId === teacher.specialization)?.name || 'Fan yo\'q') : 'O\'quv bo\'limi'}</span></div><div className="flex flex-wrap gap-1">{teacher.assignedGrades?.map(g => (<span key={g} className="px-2 py-0.5 bg-white/5 rounded text-[10px] border border-white/10">{g}</span>))}</div></div><button onClick={() => onDelete(teacher.id)} className="w-full py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all flex items-center justify-center gap-2">O'chirish</button></div>))}
      </div>
      {isModalOpen && (<div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4"><div className="glass-card rounded-[3rem] w-full max-w-xl overflow-hidden border-cyan-500/20 max-h-[90vh] overflow-y-auto custom-scrollbar"><div className="bg-cyan-500 px-10 py-8 text-black flex justify-between items-center"><div><h3 className="text-3xl font-black tracking-tighter">YANGI XODIM</h3></div><button onClick={() => setIsModalOpen(false)}><X size={24} /></button></div><form onSubmit={handleSubmit} className="p-10 space-y-6"><div className="flex gap-4 mb-4"><button type="button" onClick={() => setFormData({...formData, role: 'TEACHER'})} className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase ${formData.role === 'TEACHER' ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-950 text-slate-500 border-white/5'}`}>O'qituvchi</button><button type="button" onClick={() => setFormData({...formData, role: 'ACADEMIC'})} className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase ${formData.role === 'ACADEMIC' ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-950 text-slate-500 border-white/5'}`}>O'quv Bo'limi</button></div><div className="grid grid-cols-2 gap-6"><input required placeholder="Ism" className="bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500/50" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /><input required placeholder="Familiya" className="bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500/50" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div><input required placeholder="Username" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /><input required type="password" placeholder="Parol" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />{formData.role === 'TEACHER' && (<select required={formData.role === 'TEACHER'} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-cyan-400 font-black outline-none" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})}><option value="">Fan tanlang</option>{subjects.map(s => <option key={s.id} value={s.subjectId}>{s.name}</option>)}</select>)}<div className="space-y-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sinflar</label><div className="grid grid-cols-4 gap-2">{classes.map(grade => (<button key={grade} type="button" onClick={() => toggleGrade(grade)} className={`py-2 text-[10px] font-black rounded-xl border transition-all ${formData.assignedGrades.includes(grade) ? 'bg-cyan-500 text-black' : 'bg-slate-950 text-slate-500'}`}>{grade}</button>))}</div></div><button type="submit" disabled={submitting} className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-500/20">{submitting ? "SAQLANMOQDA..." : "XODIMNI RO'YXATGA OLISH"}</button></form></div></div>)}
    </div>
  );
};

export default TeachersPage;
