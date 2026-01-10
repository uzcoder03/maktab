
import React, { useState } from 'react';
import { SchoolClass } from '../types';
import { Plus, Trash2, LayoutGrid, Key, Info, X, Loader2, Save } from 'lucide-react';

interface ClassesPageProps {
  classes: SchoolClass[];
  onAdd: (c: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ClassesPage: React.FC<ClassesPageProps> = ({ classes, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ classId: '', name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAdd(formData);
      setIsModalOpen(false);
      setFormData({ classId: '', name: '' });
    } catch (err) {
      alert("Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="glass-card p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 border-cyan-500/20">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Sinflar <span className="text-cyan-400">Boshqaruvi</span></h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Maktabdagi barcha o'quv guruhlari va sinflar</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-cyan-500 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs flex items-center gap-3"
        >
          <Plus size={18} strokeWidth={3} /> Yangi Sinf Qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classes.map(c => (
          <div key={c.id} className="glass-card p-8 rounded-[2.5rem] relative group border-white/5 hover:border-cyan-400/40 transition-all">
            <div className={`p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit mb-6 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-all shadow-xl`}>
              <LayoutGrid size={24} />
            </div>
            <h4 className="font-black text-white text-2xl mb-1 tracking-tight">{c.name}</h4>
            <div className="flex items-center gap-2 mb-4">
               <Key size={10} className="text-cyan-500" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">{c.classId}</p>
            </div>
            
            <button 
              onClick={() => onDelete(c.id)}
              className="text-slate-700 hover:text-rose-500 transition-colors p-3 absolute top-6 right-6 bg-white/5 rounded-xl hover:bg-rose-500/10"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center opacity-20">
            <LayoutGrid size={64} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.5em]">Sinflar mavjud emas</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="glass-card rounded-[3rem] w-full max-w-xl overflow-hidden border-cyan-500/20 shadow-2xl">
            <div className="bg-cyan-500 px-10 py-10 text-black flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black tracking-tighter uppercase">Yangi Sinf</h3>
                <p className="text-black/60 font-black text-[10px] uppercase tracking-widest">Guruh ma'lumotlarini kiriting</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sinf ID (Unikal)</label>
                <input required placeholder="Masalan: CLS-001" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-cyan-400 font-black outline-none focus:border-cyan-500/50 uppercase" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value.toUpperCase()})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sinf Nomi</label>
                <input required placeholder="Masalan: 9-A, 10-B..." className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <button type="submit" disabled={submitting} className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-all">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18}/>}
                SAQLASH
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
