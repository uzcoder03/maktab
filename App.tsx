
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Debtors from './pages/Debtors';
import Payments from './pages/Payments';
import AttendancePage from './pages/Attendance';
import AbsenceManager from './pages/AbsenceManager';
import Grades from './pages/Grades';
import Exams from './pages/Exams';
import ClubPage from './pages/Club';
import TeachersPage from './pages/Teachers';
import SubjectsPage from './pages/Subjects';
import ClassesPage from './pages/Classes';
import Profile from './pages/Profile';
import TestCenter from './pages/TestCenter';
import StudentGrades from './pages/StudentGrades';
import ForcePasswordChange from './pages/ForcePasswordChange';
import Login from './pages/Login';
import { AppState, User, Test, TestResult } from './types';
import { STORAGE_KEYS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem(STORAGE_KEYS.TOKEN));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [state, setState] = useState<AppState>({ 
    students: [], attendance: [], dailyGrades: [], exams: [], teachers: [], subjects: [], classes: [],
    clubMemberships: [], clubName: 'Velmor Cyber Club', homework: [],
    clubAttendance: [], clubGrades: [], tests: [], testResults: []
  });

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const endpoints = ['students', 'attendance', 'grades', 'exams', 'teachers', 'subjects', 'homework', 'classes', 'club/memberships', 'tests', 'test-results'];
      const results = await Promise.allSettled(
        endpoints.map(ep => fetch(`/api/${ep}`, { headers: getHeaders() }).then(r => r.ok ? r.json() : []))
      );
      
      const [students, attendance, dailyGrades, exams, teachers, subjects, homework, classes, clubMemberships, tests, testResults] = results.map(res => 
        res.status === 'fulfilled' ? res.value : []
      );

      const mapId = (arr: any[]) => Array.isArray(arr) ? arr.map(item => ({ ...item, id: item._id || item.id })) : [];
      
      setState(prev => ({
        ...prev,
        students: mapId(students),
        attendance: mapId(attendance),
        dailyGrades: mapId(dailyGrades),
        exams: mapId(exams),
        teachers: mapId(teachers),
        subjects: mapId(subjects),
        homework: mapId(homework),
        classes: mapId(classes),
        clubMemberships: mapId(clubMemberships),
        testResults: mapId(testResults),
        tests: mapId(tests).length > 0 ? mapId(tests) : []
      }));
    } catch (e) { console.error(e); }
  }, [token, getHeaders]);

  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

  const handleSaveTestResult = async (result: TestResult) => {
    await fetch('/api/test-results', { method: 'POST', headers: getHeaders(), body: JSON.stringify(result) });
    
    // Agar o'quvchi aldagan bo'lsa, kundalik bahosini 0 qilish
    if (result.status === 'cheated') {
      const test = state.tests.find(t => t.id === result.testId);
      if (test) {
        await fetch('/api/grades', { 
          method: 'POST', 
          headers: getHeaders(), 
          body: JSON.stringify([{
            studentId: result.studentId,
            subjectId: test.subjectId,
            date: new Date().toISOString().split('T')[0],
            grade: 0,
            comment: 'Anti-Cheat: Imtihon qoidalari buzilganligi uchun 0 ball'
          }])
        });
      }
    }
    fetchData();
  };

  const handleResetTestAttempt = async (resultId: string) => {
    await fetch(`/api/test-results/${resultId}`, { method: 'DELETE', headers: getHeaders() });
    fetchData();
  };

  const handleLogin = (userData: User, userToken: string) => {
    setUser(userData); setToken(userToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN, userToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const handlePasswordResetComplete = () => {
    if (user) {
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;

  if (user.role === 'STUDENT' && user.mustChangePassword) {
    return <ForcePasswordChange user={user} onPasswordChanged={handlePasswordResetComplete} />;
  }

  const renderContent = () => {
    const classNames = state.classes.map(c => c.name);
    
    if (user.role === 'STUDENT') {
      const studentTests = state.tests.filter(t => t.grade === user.grade);
      return (
        <>
          {activeTab === 'dashboard' && <Dashboard state={state} user={user} />}
          {activeTab === 'my-grades' && <StudentGrades state={state} user={user} />}
          {activeTab === 'my-tests' && <TestCenter user={user} tests={studentTests} testResults={state.testResults} onSaveResult={handleSaveTestResult} />}
          {activeTab === 'profile' && <Profile user={user} state={state} />}
        </>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} user={user} />;
      case 'profile': return <Profile user={user} state={state} />;
      case 'tests': return <TestCenter user={user} tests={state.tests} testResults={state.testResults} onSaveTest={async (t) => { await fetch('/api/tests', { method: 'POST', headers: getHeaders(), body: JSON.stringify(t) }); fetchData(); }} onResetAttempt={handleResetTestAttempt} />;
      case 'absent-calls':
        return (
          <AbsenceManager 
            students={state.students} attendance={state.attendance} homework={state.homework} user={user} 
            onUpdateComment={async (id, comment) => { await fetch(`/api/attendance/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ comment }) }); fetchData(); }} 
          />
        );
      case 'grades':
        return (
          <Grades 
            students={state.students} grades={state.dailyGrades} homework={state.homework} attendance={state.attendance} user={user} classes={classNames}
            setGrades={async (recs) => { await fetch('/api/grades', { method: 'POST', headers: getHeaders(), body: JSON.stringify(recs) }); fetchData(); }}
            setHomework={async (recs) => { await fetch('/api/homework', { method: 'POST', headers: getHeaders(), body: JSON.stringify(recs) }); fetchData(); }}
          />
        );
      case 'students': return <Students students={state.students} subjects={state.subjects} attendance={state.attendance} dailyGrades={state.dailyGrades} exams={state.exams} role={user.role} user={user} classes={classNames} onAdd={async (s) => { await fetch('/api/students', { method: 'POST', headers: getHeaders(), body: JSON.stringify(s) }); fetchData(); }} onUpdate={async (id, s) => { await fetch(`/api/students/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(s) }); fetchData(); }} onDelete={() => {}} />;
      case 'debtors': return <Debtors students={state.students} user={user} onNavigateToPayment={(id) => { setActiveTab('payments'); }} />;
      case 'payments': return <Payments students={state.students} user={user} classes={classNames} onAddPayment={async (sid, amt, isF, mth, com) => { const res = await fetch('/api/payments', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ studentId: sid, amount: amt, type: 'income', forMonth: mth, comment: com }) }); const data = await res.json(); fetchData(); return data; }} />;
      case 'attendance': return <AttendancePage students={state.students} attendance={state.attendance} user={user} classes={classNames} setAttendance={async (recs) => { await fetch('/api/attendance', { method: 'POST', headers: getHeaders(), body: JSON.stringify(recs) }); fetchData(); }} />;
      case 'exams': return <Exams students={state.students} exams={state.exams} user={user} classes={classNames} setExams={async (ex) => { await fetch('/api/exams', { method: 'POST', headers: getHeaders(), body: JSON.stringify(ex) }); fetchData(); }} />;
      case 'club': 
        return (
          <ClubPage 
            students={state.students} clubMemberships={state.clubMemberships} clubAttendance={state.clubAttendance} clubGrades={state.clubGrades} clubName={state.clubName}
            setClubAttendance={async (recs) => { await fetch('/api/club/attendance', { method: 'POST', headers: getHeaders(), body: JSON.stringify(recs) }); fetchData(); }}
            setClubGrades={async (recs) => { await fetch('/api/club/grades', { method: 'POST', headers: getHeaders(), body: JSON.stringify(recs) }); fetchData(); }}
            toggleMember={async (sid, isM) => { await fetch(`/api/club/members/${sid}`, { method: isM ? 'POST' : 'DELETE', headers: getHeaders() }); fetchData(); }}
            updateClubName={(name) => setState(p => ({...p, clubName: name}))}
            user={user}
          />
        );
      case 'teachers': return <TeachersPage teachers={state.teachers} subjects={state.subjects} classes={classNames} onAdd={async (t)=>{ await fetch('/api/teachers', {method:'POST', headers:getHeaders(), body:JSON.stringify(t)}); fetchData(); }} onDelete={async (id)=>{ await fetch(`/api/teachers/${id}`, {method:'DELETE', headers:getHeaders()}); fetchData(); }} />;
      case 'subjects': return <SubjectsPage subjects={state.subjects} onAdd={async (s)=>{ await fetch('/api/subjects', {method:'POST', headers:getHeaders(), body:JSON.stringify(s)}); fetchData(); }} onDelete={async (id)=>{ await fetch(`/api/subjects/${id}`, {method:'DELETE', headers:getHeaders()}); fetchData(); }} />;
      case 'classes': return <ClassesPage classes={state.classes} onAdd={async (c)=>{ await fetch('/api/classes', {method:'POST', headers:getHeaders(), body:JSON.stringify(c)}); fetchData(); }} onDelete={async (id)=>{ await fetch(`/api/classes/${id}`, {method:'DELETE', headers:getHeaders()}); fetchData(); }} />;
      default: return <Dashboard state={state} user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#010409] overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} role={user.role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header user={user} activeTab={activeTab} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-3 md:p-8 custom-scrollbar relative">
           {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
