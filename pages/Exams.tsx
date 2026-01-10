
import React, { useState, useMemo, useRef } from 'react';
import { Student, Exam, User } from '../types';
import { 
  GraduationCap, Search, Download, Upload, FileSpreadsheet, 
  CheckCircle2, AlertCircle, Loader2, Filter, ChevronDown, Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExamsProps {
  students: Student[];
  exams: Exam[];
  setExams: (exam: any) => void;
  classes: string[];
  user?: User | null;
}

const Exams: React.FC<ExamsProps> = ({ students, exams, setExams, classes, user }) => {
  const teacherGrades = user?.role === 'TEACHER' ? user.assignedGrades || [] : classes;
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [examName, setExamName] = useState('');
  const [score, setScore] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.grade === selectedClass);
  }, [students, selectedClass]);

  const filteredExams = useMemo(() => {
    return exams.filter(ex => {
      const student = students.find(s => s.id === ex.studentId);
      const search = searchTerm.toLowerCase();
      const matchName = student ? `${student.firstName} ${student.lastName}`.toLowerCase().includes(search) : false;
      const matchExam = ex.examName.toLowerCase().includes(search);
      return matchName || matchExam;
    });
  }, [exams, students, searchTerm]);

  const handleAddExam = async () => {
    if (!selectedClass || !selectedStudent || !examName || score === '') {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    setLoading(true);
    try {
      await setExams({
        studentId: selectedStudent,
        examName,
        date: new Date().toISOString().split('T')[0],
        score: Number(score),
        subjectId: user?.specialization || 'GENERAL'
      });
      setScore('');
      setSelectedStudent('');
      alert("Natija muvaffaqiyatli saqlandi!");
    } catch (err) {
      alert("Saqlashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    if (!selectedClass || !examName) {
      alert("Avval sinf va imtihon nomini kiriting!");
      return;
    }
    const classStudents = students.filter(s => s.grade === selectedClass);
    const data = classStudents.map(s => ({
      'ID_KODI': s.studentId,
      'FIO': `${s.firstName} ${s.lastName}`,
      'SINF': s.grade,
      'IMTIHON': examName,
      'BALL_0_100': ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Natijalar");
    XLSX.writeFile(wb, `${selectedClass}_${examName}_Shablon.xlsx`);
    setIsMenuOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        const newExams = data.map((row: any) => {
          const student = students.find(s => s.studentId === row['ID_KODI']);
          if (student && row['BALL_0_100'] !== undefined) {
            return {
              studentId: student.id,
              examName: row['IMTIHON'] || examName,
              date: new Date().toISOString().split('T')[0],
              score: Number(row['BALL_0_100']),
              subjectId: user?.specialization || 'GENERAL'
            };
          }
          return null;
        }).filter(x => x !== null);

        if (newExams.length > 0) {
          await setExams(newExams);
          alert(`${newExams.length} ta o'quvchi natijasi yuklandi!`);
        } else {
          alert("Faylda mos keluvchi ma'lumotlar topilmadi.");
        }
      } catch (err) {
        alert("Faylni o'qishda xatolik.");
      } finally {
        setLoading(false);
        setIsMenuOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8 animate-fade pb-20">
      {/* Top Action Bar */}
      <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="text-blue-500" size={32} /> Imtihon Natijalari
          </h2>
          <p className="text-slate-500 text-sm mt-1">O'quvchilar ballarini kiritish va tahlil qilish</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Natijalardan qidirish..." 
              className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-white outline-none focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              <FileSpreadsheet size={18} /> Excel <ChevronDown size={14} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#1e293b] border border-white/5 rounded-2xl p-2 shadow-2xl z-50">
                <button onClick={downloadTemplate} className="w-full text-left px-5 py-3 hover:bg-white/5 rounded-xl flex items-center gap-3 text-slate-300 text-sm font-semibold transition-colors">
                  <Download size={16} className="text-blue-400" /> Shablonni yuklash
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-5 py-3 hover:bg-white/5 rounded-xl flex items-center gap-3 text-slate-300 text-sm font-semibold transition-colors">
                  <Upload size={16} className="text-emerald-400" /> Excel orqali yuklash
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-white/5 shadow-xl h-fit">
          <h3 className="text-lg font-bold text-white mb-8 border-b border-white/5 pb-4">Yangi natija kiritish</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Sinfni tanlang</label>
              <select 
                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
              >
                <option value="">Sinf...</option>
                {teacherGrades.map(c => <option key={c} value={c}>{c} SINF</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Imtihon nomi</label>
              <input 
                type="text" 
                placeholder="Masalan: 1-Chorak yakuni"
                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">O'quvchini tanlang</label>
              <select 
                disabled={!selectedClass}
                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all cursor-pointer disabled:opacity-30"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Ism-familiya...</option>
                {availableStudents.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Olingan ball (0-100)</label>
              <input 
                type="number" 
                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-2xl font-black text-blue-500 outline-none focus:border-blue-500 transition-all text-center"
                value={score}
                onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>

            <button 
              onClick={handleAddExam}
              disabled={loading || !selectedStudent}
              className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:grayscale"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              Natijani saqlash
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="lg:col-span-2 bg-[#0f172a] rounded-[2.5rem] p-8 border border-white/5 shadow-xl flex flex-col min-h-[600px]">
          <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/5">
             <h3 className="text-lg font-bold text-white flex items-center gap-3">
               <History className="text-blue-500" size={20} /> Oxirgi natijalar
             </h3>
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jami: {filteredExams.length}</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {[...filteredExams].reverse().map(ex => {
              const student = students.find(s => s.id === ex.studentId);
              return (
                <div key={ex.id} className="flex items-center justify-between p-6 bg-slate-950/50 border border-white/5 rounded-3xl hover:bg-white/5 transition-all group">
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-bold text-xl transition-all ${ex.score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : ex.score >= 50 ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                        {ex.score}
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{ex.examName}</h4>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {student?.firstName} {student?.lastName} <span className="text-slate-700 mx-2">|</span> {student?.grade} SINF
                        </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ex.subjectId}</span>
                      <p className="text-[10px] text-slate-600 font-bold mt-2">{ex.date}</p>
                   </div>
                </div>
              );
            })}
            
            {filteredExams.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                <AlertCircle size={48} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest text-center">Natijalar topilmadi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImport} />
    </div>
  );
};

const History = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
  </svg>
);

export default Exams;
