
import React, { useState, useMemo, useRef } from 'react';
import { Student, Role, User, Subject, Attendance, DailyGrade, Exam } from '../types';
import * as XLSX from 'xlsx';
import { 
  Search, Plus, Filter, MoreVertical, Phone, MapPin, 
  CreditCard, ChevronRight, Download, Upload, UserPlus, X, Shield, Activity, Fingerprint, Database,
  FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Settings2, Trash2, Edit3
} from 'lucide-react';
import { generateStudentPassportPDF } from '../utils/pdfGenerator';

interface StudentsProps {
  students: Student[];
  subjects: Subject[];
  attendance: Attendance[];
  dailyGrades: DailyGrade[];
  exams: Exam[];
  classes: string[];
  onAdd: (s: any) => Promise<any>;
  onUpdate: (id: string, s: any) => Promise<any>;
  onDelete: (id: string) => void;
  role: Role;
  user?: User | null;
}

const Students: React.FC<StudentsProps> = ({ 
  students, subjects, attendance, dailyGrades, exams, classes, onAdd, onUpdate, role, user 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    studentId: '',
    parentPhone: '',
    livingStatus: 'home' as 'home' | 'dormitory',
    address: '',
    monthlyFee: 0
  });

  const allowedClasses = useMemo(() => {
    if (user?.role === 'TEACHER') return user.assignedGrades || [];
    return classes;
  }, [user, classes]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchLower) || s.studentId?.toLowerCase().includes(searchLower);
      const matchesClass = classFilter === 'All' || s.grade === classFilter;
      const isTeacherAccess = user?.role === 'TEACHER' ? allowedClasses.includes(s.grade) : true;
      return matchesSearch && matchesClass && isTeacherAccess;
    });
  }, [students, searchTerm, classFilter, user, allowedClasses]);

  const handlePassportGen = (student: Student) => {
    generateStudentPassportPDF(student, dailyGrades, exams, attendance, subjects);
  };

  const downloadTemplate = () => {
    const data = [
      { "Ism": "Ali", "Familiya": "Valiyev", "Sinf": "9-A", "ID_Kodi": "S1001", "Ota_ona_tel": "+998901234567", "Yashash": "home", "Manzil": "Toshkent sh.", "Oylik_Tolov": 500000 },
      { "Ism": "Olim", "Familiya": "Hasanov", "Sinf": "9-A", "ID_Kodi": "S1002", "Ota_ona_tel": "+998907654321", "Yashash": "dormitory", "Manzil": "Samarqand vil.", "Oylik_Tolov": 500000 }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "O'quvchilar");
    XLSX.writeFile(wb, "Oquvchilar_Shabloni.xlsx");
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const mapped = data.map((row: any) => ({
          firstName: row.Ism,
          lastName: row.Familiya,
          grade: row.Sinf,
          studentId: row.ID_Kodi?.toString() || `S${Math.floor(1000 + Math.random() * 9000)}`,
          parentPhone: row.Ota_ona_tel?.toString() || '',
          livingStatus: row.Yashash === 'dormitory' ? 'dormitory' : 'home',
          address: row.Manzil || '',
          monthlyFee: Number(row.Oylik_Tolov) || 0
        }));
        
        setImportPreview(mapped);
        setIsImporting(true);
      } catch (err) {
        alert("Faylni o'qishda xatolik!");
      }
    };
    reader.readAsBinaryString(file);
  };

  const commitImport = async () => {
    setImportPreview([]);
    setIsImporting(false);
    for (const s of importPreview) {
      await onAdd(s);
    }
    alert("Barcha o'quvchilar muvaffaqiyatli yuklandi!");
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.grade) {
      alert("Ism va Sinfni kiriting!");
      return;
    }
    await onAdd(formData);
    setIsModalOpen(false);
    setFormData({ firstName: '', lastName: '', grade: '', studentId: '', parentPhone: '', livingStatus: 'home', address: '', monthlyFee: 0 });
  };

  return (
    <div className="space-y-10 animate-fade pb-20 mono">
      {/* Header Banner */}
      <div className="bg-[#0f172a] p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Database size={200} className="text-cyan-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <Activity size={16} className="text-cyan-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Central_Database_V2.0</span>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">O'quvchilar <span className="text-cyan-500">Tugunlari</span></h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
                 <Shield size={12} className="text-emerald-500" /> Jami: {filteredStudents.length} Ta Faol Agent Aniqlangan
              </p>
           </div>
           <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={downloadTemplate} className="px-6 py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:text-white transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest">
                <Download size={16} /> Shablon
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="px-6 py-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black rounded-2xl hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest">
                <Upload size={16} /> Excel_Import
              </button>
              <button onClick={() => setIsModalOpen(true)} className="px-10 py-5 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/20 flex items-center gap-3 text-[10px] uppercase tracking-widest">
                <UserPlus size={18} /> Yangi_Agent
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
           </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
             <Search className="text-slate-600 group-focus-within:text-cyan-500 transition-colors" size={20} />
          </div>
          <input 
            type="text" placeholder="Ism yoki ID bo'yicha qidirish..." 
            className="w-full bg-[#0f172a] border border-white/5 rounded-[2rem] pl-16 pr-8 py-5 text-white font-black outline-none focus:border-cyan-500/30 transition-all shadow-2xl uppercase text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-[#0f172a] border border-white/5 rounded-[2rem] px-8 py-2 flex items-center gap-4 shadow-2xl">
          <Filter size={18} className="text-cyan-500" />
          <select 
            value={classFilter} 
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-transparent border-none text-[10px] font-black text-white uppercase tracking-widest outline-none cursor-pointer pr-4 appearance-none"
          >
            <option value="All" className="bg-[#0f172a]">Barcha sinflar</option>
            {allowedClasses.map(c => <option key={c} value={c} className="bg-[#0f172a]">{c} SINF</option>)}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStudents.map(student => (
          <div key={student.id} className="bg-[#0f172a] p-8 rounded-[3.5rem] border border-white/5 hover:border-cyan-500/20 transition-all relative overflow-hidden group shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-500 font-black text-2xl border border-white/5 shadow-2xl group-hover:scale-110 transition-transform relative italic">
                  {student.firstName[0]}
                </div>
                <div>
                  <h4 className="font-black text-white text-xl tracking-tight uppercase italic">{student.firstName} {student.lastName}</h4>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">{student.studentId} // {student.grade}</p>
                </div>
              </div>
              <button className="p-3 text-slate-700 hover:text-white transition-colors bg-white/5 rounded-2xl"><MoreVertical size={18}/></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
               <div className="p-5 bg-slate-950/50 rounded-3xl border border-white/5">
                  <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1 italic">Balance</p>
                  <p className={`text-sm font-black ${student.balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{student.balance.toLocaleString()} UZS</p>
               </div>
               <div className="p-5 bg-slate-950/50 rounded-3xl border border-white/5">
                  <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1 italic">Living</p>
                  <p className="text-sm font-black text-white uppercase italic">{student.livingStatus === 'dormitory' ? 'Yotoqxona' : 'Uyidan'}</p>
               </div>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest italic border-l-2 border-cyan-500/30 pl-4">
                  <Phone size={14} className="text-cyan-500" /> {student.parentPhone || "NO_CONNECTION"}
               </div>
               <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest italic border-l-2 border-slate-800 pl-4">
                  <MapPin size={14} className="text-slate-600" /> {student.address || "NO_LOCATION"}
               </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => handlePassportGen(student)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">ID_PASSPORT</button>
              <button className="flex-1 py-4 bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 font-black rounded-2xl text-[9px] uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all">EDIT_LOG</button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0f172a] rounded-[4rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-10 bg-cyan-600 text-white flex justify-between items-center relative">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Yangi Agent_ID</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-black/10 p-2 rounded-full transition-colors"><X size={28}/></button>
             </div>
             <form onSubmit={handleManualAdd} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Agent_Ismi</label>
                  <input required className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-cyan-500" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Agent_Familiyasi</label>
                  <input required className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-cyan-500" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Sinf (Sektor)</label>
                  <select required className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-cyan-500 appearance-none" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                    <option value="">Tanlang...</option>
                    {allowedClasses.map(c => <option key={c} value={c}>{c} SINF</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">ID_Kodi (S1001)</label>
                  <input className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-cyan-500" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Ota-ona_Telefoni</label>
                  <input className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-cyan-500" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Oylik_Tolov</label>
                  <input type="number" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-emerald-500 font-black outline-none focus:border-cyan-500" value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: Number(e.target.value)})} />
                </div>
                <button type="submit" className="md:col-span-2 py-6 bg-cyan-600 text-white font-black rounded-3xl uppercase text-xs tracking-[0.5em] shadow-xl shadow-cyan-600/20 hover:scale-[1.02] transition-all italic">DATABASE_COMMIT</button>
             </form>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[110] p-6">
          <div className="w-full max-w-4xl bg-[#0f172a] rounded-[4rem] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-indigo-600 text-white">
               <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">Import_Review</h3>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Jami yuklangan: {importPreview.length} Ta Agent</p>
               </div>
               <button onClick={() => setIsImporting(false)} className="hover:bg-black/10 p-2 rounded-full transition-colors"><X size={28}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
               {importPreview.map((s, idx) => (
                 <div key={idx} className="p-6 bg-slate-950/50 border border-white/5 rounded-3xl flex justify-between items-center">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-black text-indigo-400 italic">{idx+1}</div>
                       <div>
                          <p className="text-white font-black italic">{s.firstName} {s.lastName}</p>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.studentId} | {s.grade} SINF</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-emerald-500">{s.monthlyFee.toLocaleString()} UZS</p>
                       <p className="text-[9px] font-black text-slate-700 uppercase">{s.parentPhone}</p>
                    </div>
                 </div>
               ))}
            </div>
            <div className="p-10 border-t border-white/5 bg-slate-950 flex gap-4">
               <button onClick={() => setIsImporting(false)} className="flex-1 py-5 bg-white/5 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest">Bekor_Qilish</button>
               <button onClick={commitImport} className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-600/20 italic">DATABASE_WRITE_SYNC</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
