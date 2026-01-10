
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Test, Question, User, TestResult, SchoolClass } from '../types';
import * as XLSX from 'xlsx';
import { 
  ShieldAlert, Plus, Play, Lock, Eye, Trash2, 
  Clock, AlertTriangle, Terminal, Activity,
  ShieldCheck, X, FileSpreadsheet, Download, Upload, Loader2, Check,
  RefreshCw, Ban, ChevronLeft, ChevronRight, LayoutGrid, Cpu, Zap, 
  HelpCircle, AlertCircle, FileText, Settings, Layers
} from 'lucide-react';

interface TestCenterProps {
  user: User;
  tests: Test[];
  classes: string[]; // App.tsx dan kelayotgan barcha sinf nomlari
  testResults?: TestResult[];
  onSaveTest?: (test: Test) => Promise<void>;
  onSaveResult?: (result: TestResult) => Promise<void>;
  onResetAttempt?: (resultId: string) => Promise<void>;
}

const TestCenter: React.FC<TestCenterProps> = ({ user, tests, classes, testResults = [], onSaveTest, onSaveResult, onResetAttempt }) => {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'exam-mode'>('list');
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [examState, setExamState] = useState<{
    currentIdx: number;
    totalTimeLeft: number;
    warnings: number;
    isFinished: boolean;
    isCheated: boolean;
    answers: Record<string, number>;
  } | null>(null);

  // New Test States
  const [newTest, setNewTest] = useState({
    title: '',
    grade: '',
    duration: 45,
    antiCheat: true
  });
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teacherGrades = useMemo(() => {
    if (user.role === 'ADMIN') return classes;
    return user.assignedGrades || [];
  }, [user, classes]);

  const getStudentResult = (testId: string) => {
    return testResults.find(r => r.testId === testId && r.studentId === user.id);
  };

  // EXAM LOGIC (Visibility & Anti-cheat)
  useEffect(() => {
    if (activeView !== 'exam-mode' || !currentTest || !examState || examState.isFinished) return;

    const handleVisibilityChange = () => {
      if (currentTest.antiCheatEnabled && document.visibilityState === 'hidden') {
        registerViolation();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentTest.antiCheatEnabled) return;
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'v')) || e.key === 'F12') {
        e.preventDefault();
        registerViolation();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);

    const timer = setInterval(() => {
      setExamState(prev => {
        if (!prev || prev.totalTimeLeft <= 0) {
          if (prev && !prev.isFinished) submitFinalResults(prev.answers);
          return prev ? { ...prev, isFinished: true, totalTimeLeft: 0 } : null;
        }
        return { ...prev, totalTimeLeft: prev.totalTimeLeft - 1 };
      });
    }, 1000);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(timer);
    };
  }, [activeView, currentTest, examState?.isFinished]);

  const registerViolation = () => {
    setExamState(prev => {
      if (!prev) return null;
      const newWarnings = prev.warnings + 1;
      if (newWarnings >= 2) {
        const result: TestResult = {
          id: `res-${Date.now()}`,
          testId: currentTest!.id,
          studentId: user.id,
          score: 0,
          status: 'cheated',
          date: new Date().toISOString()
        };
        onSaveResult?.(result);
        return { ...prev, warnings: newWarnings, isFinished: true, isCheated: true };
      }
      return { ...prev, warnings: newWarnings };
    });
  };

  const startExam = (test: Test) => {
    if (getStudentResult(test.id)) return;
    setCurrentTest(test);
    setExamState({
      currentIdx: 0,
      totalTimeLeft: test.totalTimeLimit * 60,
      warnings: 0,
      isFinished: false,
      isCheated: false,
      answers: {}
    });
    setActiveView('exam-mode');
    document.documentElement.requestFullscreen?.();
  };

  const submitFinalResults = (answers: Record<string, number>) => {
    if (!currentTest) return;
    let correct = 0;
    currentTest.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / currentTest.questions.length) * 100);
    const result: TestResult = {
      id: `res-${Date.now()}`,
      testId: currentTest.id,
      studentId: user.id,
      score,
      status: 'passed',
      date: new Date().toISOString()
    };
    onSaveResult?.(result);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const downloadTemplate = () => {
    const data = [
      { "Savol": "O'zbekiston poytaxti qayer?", "A": "Samarqand", "B": "Toshkent", "C": "Buxoro", "D": "Andijon", "To'g'ri Javob": "B" },
      { "Savol": "2+2=?", "A": "3", "B": "4", "C": "5", "D": "6", "To'g'ri Javob": "B" }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shablon");
    XLSX.writeFile(wb, "Test_Shabloni.xlsx");
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        const mapped: Question[] = rows.map((row: any, i) => ({
          id: `q-${Date.now()}-${i}`,
          text: row.Savol || "Savol Matni",
          options: [row.A, row.B, row.C, row.D].map(String).filter(s => s !== 'undefined'),
          correctAnswer: { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[row["To'g'ri Javob"]?.toString().toUpperCase()] || 0,
          timeLimit: 0
        }));
        setPreviewQuestions(mapped);
      } catch (err) { 
        alert("Excel formati noto'g'ri!"); 
      } finally { 
        setIsUploading(false); 
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFinalizeTest = async () => {
    if (!newTest.title || !newTest.grade || previewQuestions.length === 0) {
      alert("Iltimos, barcha maydonlarni to'ldiring va savollarni yuklang!");
      return;
    }
    
    const testPayload: Test = {
      id: `test-${Date.now()}`,
      title: newTest.title,
      grade: newTest.grade,
      subjectId: user.specialization || 'GEN',
      questions: previewQuestions,
      isActive: true,
      totalTimeLimit: newTest.duration,
      antiCheatEnabled: newTest.antiCheat
    };

    await onSaveTest?.(testPayload);
    setActiveView('list');
    setPreviewQuestions([]);
    setNewTest({ title: '', grade: '', duration: 45, antiCheat: true });
  };

  if (activeView === 'exam-mode' && currentTest && examState) {
    const q = currentTest.questions[examState.currentIdx];
    return (
      <div className="fixed inset-0 bg-[#020617] z-[200] flex flex-col mono select-none animate-in fade-in duration-500">
        <div className="h-1.5 w-full bg-white/5 relative overflow-hidden">
           <div 
             className="h-full bg-blue-500 transition-all duration-1000 ease-linear shadow-[0_0_15px_#3b82f6]" 
             style={{ width: `${(examState.totalTimeLeft / (currentTest.totalTimeLimit * 60)) * 100}%` }}
           ></div>
        </div>

        <header className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0f172a]/80 backdrop-blur-xl">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30">
                 <Cpu size={28} className="text-white" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">{currentTest.title}</h2>
                 <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic flex items-center gap-2"><Activity size={12}/> Session_Active</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Grade: {currentTest.grade}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-12">
              <div className="text-center">
                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">Time_Left</p>
                 <p className={`text-4xl font-black ${examState.totalTimeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                    {formatTime(examState.totalTimeLeft)}
                 </p>
              </div>
              {currentTest.antiCheatEnabled && (
                <div className="text-center px-8 border-l border-white/5">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">Threat_Level</p>
                   <p className={`text-2xl font-black ${examState.warnings > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {examState.warnings} / 2
                   </p>
                </div>
              )}
           </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-950/50">
           {/* Sidebar: Question Map */}
           <div className="w-full md:w-80 border-r border-white/5 p-8 overflow-y-auto custom-scrollbar bg-[#0f172a]/20">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 italic">Question_Map</h4>
              <div className="grid grid-cols-5 gap-3">
                 {currentTest.questions.map((_, i) => (
                   <button 
                     key={i}
                     onClick={() => setExamState({...examState, currentIdx: i})}
                     className={`aspect-square rounded-xl border font-black text-xs transition-all flex items-center justify-center ${
                       examState.currentIdx === i ? 'bg-blue-600 text-white border-blue-400 shadow-lg scale-110' : 
                       examState.answers[currentTest.questions[i].id] !== undefined ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' :
                       'bg-slate-900 text-slate-600 border-white/5 hover:border-white/20'
                     }`}
                   >
                     {i + 1}
                   </button>
                 ))}
              </div>
           </div>

           {/* Question Content */}
           <div className="flex-1 p-8 md:p-20 overflow-y-auto custom-scrollbar flex flex-col items-center">
              {examState.isFinished ? (
                 <div className="max-w-2xl w-full bg-[#0f172a] p-16 rounded-[4rem] border border-white/5 text-center shadow-2xl animate-fade">
                    {examState.isCheated ? (
                      <>
                        <div className="w-24 h-24 rounded-full mx-auto mb-10 bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center"><Ban size={48} /></div>
                        <h3 className="text-4xl font-black text-rose-500 italic uppercase mb-4">Access_Blocked</h3>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest leading-relaxed">Xavfsizlik qoidalari buzilganligi sababli test yakunlandi.</p>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 rounded-full mx-auto mb-10 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center"><ShieldCheck size={48} /></div>
                        <h3 className="text-4xl font-black text-white italic uppercase mb-4">Sessiya_Yakunlandi</h3>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest leading-relaxed">Barcha javoblar saqlandi.</p>
                      </>
                    )}
                    <button onClick={() => { setActiveView('list'); document.exitFullscreen?.(); }} className="mt-12 px-12 py-5 bg-blue-600 text-white font-black rounded-2xl hover:scale-105 transition-all text-xs tracking-widest">CHIQISH_COMMAND</button>
                 </div>
              ) : (
                 <div className="max-w-4xl w-full space-y-12">
                    <div className="p-10 bg-blue-600/5 border border-blue-500/10 rounded-[3rem] relative overflow-hidden">
                       <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block italic">Question_{examState.currentIdx + 1}</span>
                       <h3 className="text-3xl md:text-5xl font-black text-white leading-tight italic">{q.text}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                       {q.options.map((opt, idx) => (
                         <button 
                           key={idx} 
                           onClick={() => setExamState({...examState, answers: {...examState.answers, [q.id]: idx}})}
                           className={`w-full text-left p-8 rounded-3xl border transition-all flex items-center justify-between group ${
                             examState.answers[q.id] === idx ? 'bg-blue-600 text-white border-blue-400 shadow-xl scale-[1.02]' : 'bg-slate-900/50 text-slate-400 border-white/5 hover:border-white/10'
                           }`}
                         >
                           <div className="flex items-center gap-6">
                              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm ${examState.answers[q.id] === idx ? 'bg-white text-blue-600 border-white' : 'border-white/10 text-slate-600'}`}>
                                 {String.fromCharCode(65 + idx)}
                              </div>
                              <span className="text-xl font-bold italic">{opt}</span>
                           </div>
                         </button>
                       ))}
                    </div>

                    <div className="flex justify-between items-center pt-10">
                       <div className="flex gap-4">
                          <button disabled={examState.currentIdx === 0} onClick={() => setExamState({...examState, currentIdx: examState.currentIdx - 1})} className="p-6 bg-white/5 text-white rounded-2xl hover:bg-white/10 disabled:opacity-10 border border-white/5"><ChevronLeft size={24} /></button>
                          <button disabled={examState.currentIdx === currentTest.questions.length - 1} onClick={() => setExamState({...examState, currentIdx: examState.currentIdx + 1})} className="p-6 bg-white/5 text-white rounded-2xl hover:bg-white/10 disabled:opacity-10 border border-white/5"><ChevronRight size={24} /></button>
                       </div>
                       <button onClick={() => { if(window.confirm("Testni yakunlaysizmi?")) { submitFinalResults(examState.answers); setExamState({...examState, isFinished: true}); } }} className="px-12 py-6 bg-emerald-600 text-white font-black rounded-3xl text-[10px] tracking-widest uppercase hover:bg-emerald-500 shadow-xl transition-all">Finish_Attempt</button>
                    </div>
                 </div>
              )}
           </div>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade pb-20 mono">
      {/* Dashboard Header */}
      <div className="bg-[#0f172a] p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <ShieldAlert size={200} className="text-blue-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
           <div>
              <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Test <span className="text-blue-500">Terminal</span></h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Secure_Examination_Control_System v3.0</p>
           </div>
           {user.role !== 'STUDENT' && (
             <button 
                onClick={() => setActiveView('create')} 
                className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-600/20 text-[10px] tracking-widest uppercase flex items-center gap-3 transition-all active:scale-95"
             >
               <Plus size={18} strokeWidth={3} /> Test_Konstruktori
             </button>
           )}
        </div>
      </div>

      {activeView === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6 duration-500">
          {/* Step 1: Config */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-[#0f172a] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-8">
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                  <Settings className="text-blue-500" size={20} /> Parametrlar
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Test_Nomi</label>
                    <input 
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-blue-500 italic"
                      placeholder="Masalan: Choraklik Test"
                      value={newTest.title}
                      onChange={e => setNewTest({...newTest, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Sinfni_Tanlang</label>
                    <select 
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-blue-500 italic appearance-none"
                      value={newTest.grade}
                      onChange={e => setNewTest({...newTest, grade: e.target.value})}
                    >
                      <option value="">Tanlang...</option>
                      {teacherGrades.map(g => <option key={g} value={g}>{g} SINF</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Vaqt_Limiti (Min)</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-blue-500 italic"
                      value={newTest.duration}
                      onChange={e => setNewTest({...newTest, duration: Number(e.target.value)})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-950 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className={newTest.antiCheat ? 'text-emerald-500' : 'text-slate-700'} size={20} />
                       <span className="text-[10px] font-black text-slate-500 uppercase italic">Anti-Cheat Mode</span>
                    </div>
                    <button 
                      onClick={() => setNewTest({...newTest, antiCheat: !newTest.antiCheat})}
                      className={`w-12 h-6 rounded-full transition-all relative ${newTest.antiCheat ? 'bg-emerald-600' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newTest.antiCheat ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                  <button onClick={downloadTemplate} className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                    <Download size={14} /> Shabloni_Yuklash
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full py-5 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all">
                    <Upload size={14} /> Excel_Import
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
                </div>
             </div>
          </div>

          {/* Step 2: Preview & Commit */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-[#0f172a] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                   <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                     <Layers className="text-blue-500" size={20} /> Savollar_Preview ({previewQuestions.length})
                   </h3>
                   <div className="flex gap-4">
                      <button onClick={() => { setPreviewQuestions([]); setActiveView('list'); }} className="px-6 py-3 text-slate-500 font-black text-[10px] uppercase hover:text-white transition-all">Bekor_Qilish</button>
                      <button 
                        onClick={handleFinalizeTest}
                        disabled={previewQuestions.length === 0}
                        className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 disabled:opacity-20 transition-all active:scale-95"
                      >
                        DATABASE_COMMIT
                      </button>
                   </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[600px]">
                   {previewQuestions.map((q, idx) => (
                     <div key={idx} className="p-6 bg-slate-950/50 border border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all">
                        <div className="flex items-start gap-6">
                           <div className="w-10 h-10 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center font-black text-sm italic border border-blue-500/20 shrink-0">
                              {idx + 1}
                           </div>
                           <div className="space-y-4 flex-1">
                              <h5 className="text-white font-bold italic text-lg leading-relaxed">{q.text}</h5>
                              <div className="grid grid-cols-2 gap-3">
                                 {q.options.map((opt, oIdx) => (
                                   <div key={oIdx} className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-3 ${q.correctAnswer === oIdx ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-900 border-white/5 text-slate-600'}`}>
                                      <span className="opacity-40">{String.fromCharCode(65 + oIdx)}:</span> {opt}
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}

                   {previewQuestions.length === 0 && (
                     <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-20 text-center">
                        <FileText size={64} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Excel faylni yuklang</p>
                        <p className="text-[9px] font-bold mt-2">Savollar avtomatik ravishda shu yerda ko'rinadi</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tests.map(test => {
            const result = getStudentResult(test.id);
            const isCheated = result?.status === 'cheated';
            const attemptCount = testResults.filter(r => r.testId === test.id).length;

            return (
              <div key={test.id} className={`bg-[#0f172a] p-8 rounded-[3rem] border transition-all relative overflow-hidden group shadow-xl ${isCheated ? 'border-rose-500/30' : 'border-white/5 hover:border-blue-500/30'}`}>
                <div className="flex justify-between items-start mb-8">
                   <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-blue-500"><Terminal size={24} /></div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-xs font-black text-white italic">{test.totalTimeLimit} MINS</p>
                   </div>
                </div>
                
                <h4 className="text-2xl font-black text-white uppercase italic tracking-tight mb-4">{test.title}</h4>
                <div className="flex flex-wrap gap-2 mb-8">
                   <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">{test.grade} SINF</span>
                   <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">{test.questions.length} SAVOL</span>
                   {test.antiCheatEnabled && <span className="text-emerald-500 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest italic ml-2"><ShieldCheck size={12}/> Secure</span>}
                </div>

                {result ? (
                  <div className={`p-8 rounded-3xl border text-center ${isCheated ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
                     <p className="text-[9px] font-black uppercase tracking-widest mb-2">{isCheated ? 'Status: Compromised' : 'Status: Committed'}</p>
                     <p className="text-4xl font-black italic">{isCheated ? '0' : result.score}<span className="text-xs ml-1">BALL</span></p>
                  </div>
                ) : (
                  <button onClick={() => startExam(test)} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-4 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/10">Start_Access <Play size={16}/></button>
                )}

                {user.role !== 'STUDENT' && (
                  <div className="mt-8 pt-8 border-t border-white/5">
                     <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-4">Topshirganlar ({attemptCount})</p>
                     <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                        {testResults.filter(r => r.testId === test.id).map(r => (
                          <div key={r.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                             <span className="text-[10px] font-black text-white uppercase italic">{r.studentId}</span>
                             <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-black italic ${r.status === 'cheated' ? 'text-rose-500' : 'text-emerald-500'}`}>{r.status === 'cheated' ? 'CHEAT' : `${r.score}%`}</span>
                                {r.status === 'cheated' && (
                                  <button onClick={() => onResetAttempt?.(r.id)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"><RefreshCw size={14}/></button>
                                )}
                             </div>
                          </div>
                        ))}
                     </div>
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

export default TestCenter;
