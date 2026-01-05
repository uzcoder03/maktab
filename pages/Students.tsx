
import React, { useState, useMemo, useRef } from 'react';
import { Student, Role, Attendance, DailyGrade, Exam, Subject, User } from '../types';
import { 
  Search, Edit2, Trash2, X, UserPlus, Phone, Building2, Truck, Coffee,
  ChevronRight, Check, Loader2, Filter, Users, FileText, Download, Upload, FileSpreadsheet, Home, Bed, Save
} from 'lucide-react';
import { CLASSES } from '../constants';
import * as XLSX from 'xlsx';
import { generateStudentPassportPDF } from '../utils/pdfGenerator';

interface StudentsProps {
  students: Student[];
  subjects: Subject[];
  attendance: Attendance[];
  dailyGrades: DailyGrade[];
  exams: Exam[];
  onAdd: (s: any) => Promise<any>;
  onUpdate: (id: string, s: any) => Promise<any>;
  onDelete: (id: string) => void;
  role: Role;
  user?: User | null;
}

const Students: React.FC<StudentsProps> = ({ 
  students, subjects, attendance, dailyGrades, exams, onAdd, onUpdate, onDelete, role, 
  user 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const allowedClasses = useMemo(() => {
    if (user?.role === 'TEACHER') return user.assignedGrades || [];
    return CLASSES;
  }, [user]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    grade: allowedClasses[0] || '9-A',
    studentPhone: '',
    parentPhone: '',
    parentName: '',
    monthlyFee: 0,
    hasFood: false,
    hasTransport: false,
    livingStatus: 'home' as 'home' | 'dormitory',
    address: '',
    comment: '',
    registrationDate: new Date().toISOString().split('T')[0]
  });

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchLower) || 
        s.studentId?.toLowerCase().includes(searchLower);
      const matchesClass = classFilter === 'All' || s.grade === classFilter;
      const isTeacherAccess = user?.role === 'TEACHER' ? allowedClasses.includes(s.grade) : true;
      return matchesSearch && matchesClass && isTeacherAccess;
    });
  }, [students, searchTerm, classFilter, user, allowedClasses]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      firstName: '', lastName: '', studentId: '', grade: allowedClasses[0] || '9-A',
      studentPhone: '', parentPhone: '', parentName: '',
      monthlyFee: 0, hasFood: false, hasTransport: false,
      livingStatus: 'home', address: '', comment: '',
      registrationDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      studentId: student.studentId,
      grade: student.grade,
      studentPhone: student.studentPhone || '',
      parentPhone: student.parentPhone || '',
      parentName: student.parentName || '',
      monthlyFee: student.monthlyFee || 0,
      hasFood: student.hasFood || false,
      hasTransport: student.hasTransport || false,
      livingStatus: student.livingStatus || 'home',
      address: student.address || '',
      comment: student.comment || '',
      registrationDate: student.registrationDate || new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDownloadPassport = (student: Student) => {
    const sGrades = dailyGrades.filter(g => g.studentId === student.id);
    const sExams = exams.filter(e => e.studentId === student.id);
    const sAttendance = attendance.filter(a => a.studentId === student.id);
    generateStudentPassportPDF(student, sGrades, sExams, sAttendance, subjects);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      setSubmitting(true);
      try {
        for (const row of data as any[]) {
          await onAdd({
            firstName: row['Ism'],
            lastName: row['Familiya'],
            studentId: row['ID'],
            grade: row['Sinf'],
            parentName: row['Ota-ona'],
            parentPhone: row['Telefon'],
            monthlyFee: row['Tolov'] || 0,
            address: row['Manzil'] || '',
            livingStatus: row['Yashash'] === 'Yotoqxona' ? 'dormitory' : 'home'
          });
        }
        alert("Excel ma'lumotlari muvaffaqiyatli import qilindi!");
      } catch (err) {
        alert("Importda xatolik yuz berdi");
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStudent) {
        await onUpdate(editingStudent.id, formData);
      } else {
        await onAdd(formData);
      }
      closeModal();
    } catch (err) {
      alert("Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Section */}
      <div className="glass-card p-10 rounded-[3rem] border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Users size={180} className="text-cyan-500" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Boshqaruv Tizimi</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">O'quvchilar <span className="text-cyan-400">Markazi</span></h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Ro'yxatga olish, Monitoring va Akademik Hisobotlar</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl text-[10px] uppercase hover:bg-white/10 transition-all"
             >
               <Upload size={18} /> Excel Import
             </button>
             <button 
               onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
               className="flex items-center gap-3 px-8 py-4 bg-cyan-500 text-black font-black rounded-2xl text-[10px] uppercase shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
             >
               <UserPlus size={18} /> Yangi O'quvchi
             </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
           <input 
             type="text" 
             placeholder="ID raqam yoki F.I.SH bo'yicha qidirish..." 
             className="w-full bg-slate-900/50 border border-white/5 rounded-[2rem] pl-16 pr-8 py-5 text-white font-bold outline-none focus:border-cyan-500/30 transition-all shadow-inner" 
             value={searchTerm} 
             onChange={(e) => setSearchTerm(e.target.value)} 
           />
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/50 p-2 border border-white/5 rounded-[2rem] shrink-0">
           <Filter size={18} className="ml-4 text-slate-500" />
           <select 
             value={classFilter} 
             onChange={(e) => setClassFilter(e.target.value)} 
             className="bg-transparent px-6 py-3 text-[10px] font-black text-cyan-400 uppercase outline-none cursor-pointer"
           >
             <option value="All">Barcha Sinflar</option>
             {allowedClasses.map(c => <option key={c} value={c}>{c} SINF</option>)}
           </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredStudents.map(student => (
          <div key={student.id} className="glass-card p-8 rounded-[3.5rem] border-white/5 hover:border-cyan-500/20 transition-all group relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-slate-950 rounded-[1.5rem] border border-white/5 flex items-center justify-center text-cyan-400 font-black text-2xl shadow-2xl group-hover:scale-105 transition-transform">
                     {student.firstName[0]}
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-white tracking-tighter">{student.firstName} {student.lastName}</h4>
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mono">{student.studentId} | {student.grade} SINF</p>
                  </div>
               </div>
               <div className="flex gap-2">
                 {student.livingStatus === 'dormitory' ? <Bed size={18} className="text-purple-400" /> : <Home size={18} className="text-emerald-400" />}
               </div>
            </div>

            <div className="space-y-4 flex-1">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Oylik To'lov</p>
                     <p className="text-sm font-black text-emerald-400">{student.monthlyFee?.toLocaleString()} UZS</p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                     <p className="text-sm font-black text-white">{student.livingStatus === 'home' ? 'UYIDAN' : 'YOTOQXONA'}</p>
                  </div>
               </div>
               
               <div className="px-2 space-y-2">
                  <div className="flex items-center gap-3 text-slate-400 text-[11px] font-bold">
                     <Phone size={14} className="text-cyan-500" /> {student.parentPhone || 'Aloqa yo\'q'}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px] font-bold">
                     <Building2 size={14} className="text-indigo-500" /> {student.address || 'Manzil kiritilmagan'}
                  </div>
               </div>
               
               <div className="flex gap-4 pt-4 border-t border-white/5">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${student.hasFood ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'text-slate-700 border-white/5'}`}>
                     <Coffee size={14} /> Oshxona
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${student.hasTransport ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' : 'text-slate-700 border-white/5'}`}>
                     <Truck size={14} /> Transport
                  </div>
               </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
               <button 
                 onClick={() => handleDownloadPassport(student)}
                 className="col-span-1 p-4 bg-white/5 text-slate-400 hover:text-cyan-400 border border-white/5 hover:border-cyan-500/30 rounded-2xl transition-all flex items-center justify-center gap-2"
                 title="Passport (PDF)"
               >
                 <Download size={18} />
               </button>
               <button 
                 onClick={() => handleEdit(student)}
                 className="col-span-1 p-4 bg-white/5 text-slate-400 hover:text-amber-400 border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all flex items-center justify-center"
               >
                 <Edit2 size={18} />
               </button>
               <button 
                 onClick={() => onDelete(student.id)}
                 className="col-span-1 p-4 bg-white/5 text-slate-700 hover:text-rose-500 border border-white/5 hover:border-rose-500/30 rounded-2xl transition-all flex items-center justify-center"
               >
                 <Trash2 size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Registration / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-[3.5rem] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
             <div className="p-10 bg-cyan-500 text-black flex justify-between items-center sticky top-0 z-20">
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{editingStudent ? 'Tizimni Yangilash' : 'Yangi Agent Ro\'yxati'}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ma'lumotlar to'liq va aniq bo'lishi shart</p>
                </div>
                <button onClick={closeModal} className="p-3 bg-black/10 rounded-full hover:bg-black/20 transition-all"><X size={24}/></button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Info */}
                  <div className="space-y-6">
                    <h5 className="text-xs font-black text-cyan-500 uppercase tracking-widest border-b border-cyan-500/20 pb-2">Asosiy Protokol</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">ISM</label>
                        <input required className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500/40" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">FAMILIYA</label>
                        <input required className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500/40" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">AGENT ID</label>
                        <input required placeholder="S1001" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-cyan-400 font-black outline-none focus:border-cyan-500/40" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">SINF</label>
                        <select className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none appearance-none" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                          {CLASSES.map(c => <option key={c} value={c}>{c} Sinf</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">SHARTNOMA SUMMASI (OYLIK)</label>
                        <input required type="number" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-emerald-400 font-black text-xl outline-none" value={formData.monthlyFee || ''} onChange={e => setFormData({...formData, monthlyFee: Number(e.target.value)})} />
                    </div>
                  </div>

                  {/* Contact & Logistics */}
                  <div className="space-y-6">
                    <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-500/20 pb-2">Logistika va Aloqa</h5>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">OTA-ONA (VASIY) F.I.SH</label>
                        <input className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">OTA-ONA TEL</label>
                        <input className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">AGENT TEL</label>
                        <input className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" value={formData.studentPhone} onChange={e => setFormData({...formData, studentPhone: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">YASHASH MANZILI</label>
                        <input className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>

                    <div className="flex gap-4 p-2 bg-slate-950 rounded-2xl border border-white/5">
                        <button type="button" onClick={() => setFormData({...formData, livingStatus: 'home'})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${formData.livingStatus === 'home' ? 'bg-white/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'text-slate-600'}`}>
                           <Home size={16}/> Uyidan
                        </button>
                        <button type="button" onClick={() => setFormData({...formData, livingStatus: 'dormitory'})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${formData.livingStatus === 'dormitory' ? 'bg-white/10 text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-500/5' : 'text-slate-600'}`}>
                           <Bed size={16}/> Yotoqxona
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setFormData({...formData, hasFood: !formData.hasFood})} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase ${formData.hasFood ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'bg-slate-950 border-white/5 text-slate-700'}`}>
                           <Coffee size={18}/> Oshxona {formData.hasFood && <Check size={14} className="ml-auto" />}
                        </button>
                        <button type="button" onClick={() => setFormData({...formData, hasTransport: !formData.hasTransport})} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase ${formData.hasTransport ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-500' : 'bg-slate-950 border-white/5 text-slate-700'}`}>
                           <Truck size={18}/> Transport {formData.hasTransport && <Check size={14} className="ml-auto" />}
                        </button>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-6 bg-cyan-500 text-black font-black rounded-3xl uppercase tracking-widest shadow-2xl shadow-cyan-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {submitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                  {editingStudent ? 'PROTOKOLNI YANGILASH' : 'AGENTNI BAZAGA KIRITISH'}
                </button>
             </form>
          </div>
        </div>
      )}
      
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
    </div>
  );
};

export default Students;
