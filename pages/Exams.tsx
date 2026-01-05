
import React, { useState, useMemo, useRef } from 'react';
import { Student, Exam, User } from '../types';
import { GraduationCap, Search, Database, Download, Upload, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import { CLASSES } from '../constants';
import * as XLSX from 'xlsx';

interface ExamsProps {
  students: Student[];
  exams: Exam[];
  setExams: (exam: any) => void;
  user?: User | null;
}

const Exams: React.FC<ExamsProps> = ({ students, exams, setExams, user }) => {
  const teacherGrades = user?.role === 'TEACHER' ? user.assignedGrades || [] : CLASSES;
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [examName, setExamName] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.grade === selectedClass);
  }, [students, selectedClass]);

  const handleAddExam = async () => {
    if (!selectedClass) { alert("Avval sinfni tanlang!"); return; }
    if (!selectedStudent) { alert("O'quvchini tanlang!"); return; }
    if (!examName || score < 0) { alert("Natija yoki nom bo'sh bo'lishi mumkin emas!"); return; }
    
    setLoading(true);
    try {
      const newExam = {
        studentId: selectedStudent,
        examName,
        date: new Date().toISOString().split('T')[0],
        score,
        subjectId: user?.specialization
      };
      await setExams(newExam);
      setScore(0);
      setSelectedStudent('');
    } catch (err) { alert("Saqlashda xatolik yuz berdi!"); } finally { setLoading(false); }
  };

  const downloadExamTemplate = () => {
    if (!selectedClass) { alert("Iltimos, avval sinfni tanlang!"); return; }
    if (!examName) { alert("Iltimos, imtihon nomini kiriting (shablon nomi uchun)!"); return; }

    const classStudents = students.filter(s => s.grade === selectedClass);
    const data = classStudents.map(s => ({
      'Agent_ID': s.studentId,
      'F.I.SH': `${s.firstName} ${s.lastName}`,
      'Sinf': s.grade,
      'Imtihon_Nomi': examName,
      'Ball_(0-100)': ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Imtihon_Audit");
    XLSX.writeFile(wb, `${selectedClass}_${examName}_Shablon.xlsx`);
    setIsExportMenuOpen(false);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.specialization) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const importedExams = data.map((row: any) => {
          const student = students.find(s => s.studentId === row['Agent_ID']);
          const scoreVal = row['Ball_(0-100)'];
          const nameVal = row['Imtihon_Nomi'] || examName;

          if (student && scoreVal !== undefined && nameVal) {
            return {
              studentId: student.id,
              examName: nameVal,
              date: new Date().toISOString().split('T')[0],
              score: Number(scoreVal),
              subjectId: user.specialization
            };
          }
          return null;
        }).filter(x => x !== null);
        
        if (importedExams.length > 0) {
          // Ommaviy saqlash
          await setExams(importedExams);
          alert(`${importedExams.length} ta agent natijalari muvaffaqiyatli import qilindi!`);
        } else {
          alert("Faylda yaroqli ma'lumot topilmadi!");
        }
      } catch (err) {
        alert("Excel o'qishda xatolik! Formatni tekshiring.");
      } finally {
        setLoading(false);
        setIsExportMenuOpen(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredExams = exams.filter(e => {
    if (user?.role === 'TEACHER' && e.subjectId !== user.specialization) return false;
    const student = students.find(s => s.id === e.studentId);
    const searchStr = `${e.examName} ${student?.firstName} ${student?.lastName}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-1">
        <div className="glass-card p-10 rounded-[3rem] border-cyan-500/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tighter">Natija Kirish</h3>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
              >
                <Database size={20} />
              </button>
              
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-slate-900 border border-white/10 rounded-2xl p-3 shadow-2xl z-50 space-y-2 animate-in slide-in-from-top-2">
                  <p className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Excel Boshqaruvi</p>
                  <button 
                    onClick={downloadExamTemplate}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl flex items-center gap-3 text-white text-xs font-bold transition-colors"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-400" /> Shablon Yuklash
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl flex items-center gap-3 text-white text-xs font-bold transition-colors"
                  >
                    <Upload size={16} className="text-cyan-400" /> Excel Import
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">1. SINFNI TANLANG</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-black outline-none appearance-none focus:border-cyan-500 transition-all"
                  value={selectedClass}
                  onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
                >
                  <option value="">Sinf tanlang...</option>
                  {teacherGrades.map(c => <option key={c} value={c}>{c} Sinf</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">2. IMTIHON NOMI</label>
              <input 
                type="text" 
                placeholder="Masalan: Midterm"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">3. O'QUVCHI (Manual)</label>
              <div className="relative">
                <select 
                  disabled={!selectedClass}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-cyan-400 font-black outline-none appearance-none disabled:opacity-20 focus:border-cyan-500 transition-all"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">O'quvchi...</option>
                  {availableStudents.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">4. BALL (0-100)</label>
              <input 
                type="number" 
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-3xl text-cyan-400 font-black outline-none focus:border-cyan-500 transition-all" 
                value={score} 
                onChange={(e) => setScore(Number(e.target.value))} 
              />
            </div>

            <button 
              onClick={handleAddExam} 
              disabled={loading || !selectedStudent} 
              className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20 disabled:grayscale transition-all active:scale-95"
            >
              {loading ? 'ISHLANMOQDA...' : 'NATIJANI SAQLASH'}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="glass-card p-10 rounded-[3rem] h-full flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h3 className="text-2xl font-black text-white">Natijalar Arxivi</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Audit Log</p>
            </div>
            <div className="relative w-full md:w-72">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                  type="text" 
                  placeholder="Ism yoki imtihon..." 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-xs outline-none focus:border-cyan-500/30 transition-all" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[600px]">
            {[...filteredExams].reverse().map(ex => {
               const student = students.find(s => s.id === ex.studentId);
               return (
                 <div key={ex.id} className="flex items-center justify-between p-6 bg-slate-950/30 border border-white/5 rounded-3xl hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform">
                         {ex.score}
                       </div>
                       <div>
                          <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{ex.examName}</h4>
                          <p className="text-xs text-slate-500 font-medium">{student?.firstName} {student?.lastName} <span className="text-slate-700 ml-2">| {student?.grade}</span></p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">{ex.subjectId}</span>
                       <span className="text-[10px] text-slate-600 font-bold mono mt-1 block">{ex.date}</span>
                    </div>
                 </div>
               );
            })}
            {filteredExams.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <FileText size={48} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Ma'lumot topilmadi</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
    </div>
  );
};

export default Exams;
