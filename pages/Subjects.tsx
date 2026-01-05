
import React, { useState } from 'react';
import { Subject } from '../types';
import { Plus, BookOpen, Trash2, Layers, Cpu, Key, FileText, Info } from 'lucide-react';

interface SubjectsPageProps {
  subjects: Subject[];
  onAdd: (s: any) => void;
  onDelete: (id: string) => void;
}

const SubjectsPage: React.FC<SubjectsPageProps> = ({ subjects, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subjectId: '', name: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, category: 'General' }); // Ichki kategoriya standart holda 'General'
    setIsModalOpen(false);
    setFormData({ subjectId: '', name: '', description: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="glass-card p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 border-indigo-500/20">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">O'quv <span className="text-indigo-400">Fanlari</span></h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Tizimdagi barcha akademik fanlar</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-indigo-500 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-xs flex items-center gap-3"
        >
          <Plus size={18} strokeWidth={3} /> Yangi Fan Qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subjects.map(subject => (
          <div key={subject.id} className="glass-card p-8 rounded-[2.5rem] relative group border-indigo-500/10 hover:border-indigo-400/40">
            <div className={`p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 w-fit mb-6 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all`}>
              <BookOpen size={24} />
            </div>
            <h4 className="font-black text-white text-xl mb-1 tracking-tight">{subject.name}</h4>
            <div className="flex items-center gap-2 mb-4">
               <Key size={10} className="text-indigo-500" />
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mono">{subject.subjectId}</p>
            </div>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6 opacity-60 line-clamp-2">{subject.description || 'Fan tavsifi mavjud emas.'}</p>
            
            <button 
              onClick={() => onDelete(subject.id)}
              className="text-slate-700 hover:text-rose-500 transition-colors p-2 absolute top-6 right-6"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="glass-card rounded-[3rem] w-full max-w-xl overflow-hidden border-indigo-500/20">
            <div className="bg-indigo-500 px-10 py-10 text-white">
              <h3 className="text-3xl font-black tracking-tighter">YANGI FAN</h3>
              <p className="text-white/60 font-black text-[10px] uppercase tracking-widest">Ma'lumotlarni kiriting</p>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fan ID (Unikal Kod)</label>
                <input required placeholder="Masalan: CS101" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500/50" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value.toUpperCase()})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fan Nomi</label>
                <input required placeholder="Matematika, Fizika..." className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fan Tavsifi</label>
                <textarea placeholder="Fan haqida qisqacha ma'lumot..." className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500/50 resize-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 border border-white/10 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest">Bekor qilish</button>
                <button type="submit" className="flex-1 py-5 bg-indigo-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;
