
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
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import { AppState, User, Role } from './types';
import { initialMockState } from './mockData';
import { STORAGE_KEYS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem(STORAGE_KEYS.THEME) || 'cyber');
  const [scale, setScale] = useState(localStorage.getItem(STORAGE_KEYS.SCALE) || 'medium');
  const [state, setState] = useState<AppState>({ 
    ...initialMockState,
    clubMemberships: [],
    clubName: 'Kiber To\'garak'
  });
  const [targetStudentId, setTargetStudentId] = useState<string | null>(null);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const endpoints = [
        'students', 'attendance', 'grades', 'exams', 'teachers', 'subjects', 
        'club/members', 'club/config'
      ];
      const results = await Promise.allSettled(
        endpoints.map(ep => fetch(`/api/${ep}`, { headers: getHeaders() }).then(r => r.ok ? r.json() : []))
      );
      
      const [students, attendance, dailyGrades, exams, teachers, subjects, clubMembers, clubConf] = results.map(res => 
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
        clubMemberships: Array.isArray(clubMembers) ? clubMembers : [],
        clubName: clubConf?.value || 'Kiber To\'garak'
      }));
    } catch (e) {
      console.error("Data fetch error:", e);
    }
  }, [token, getHeaders]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, fetchData]);

  const handleLogin = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} user={user} />;
      case 'students':
        return (
          <Students 
            students={state.students} subjects={state.subjects} attendance={state.attendance} 
            dailyGrades={state.dailyGrades} exams={state.exams} role={user.role} user={user} 
            onAdd={async (s) => { await fetch('/api/students', { method: 'POST', headers: getHeaders(), body: JSON.stringify(s) }); fetchData(); }} 
            onUpdate={async (id, s) => { await fetch(`/api/students/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(s) }); fetchData(); }} 
            onDelete={async (id) => { if(confirm("O'chirishni tasdiqlaysizmi?")) { await fetch(`/api/students/${id}`, { method: 'DELETE', headers: getHeaders() }); fetchData(); } }} 
          />
        );
      case 'absent-calls':
        return (
          <AbsenceManager 
            students={state.students} attendance={state.attendance} user={user} 
            onUpdateComment={async (id, comment) => { await fetch(`/api/attendance/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ comment }) }); fetchData(); }} 
          />
        );
      case 'debtors':
        return <Debtors students={state.students} user={user} onNavigateToPayment={(id) => { setTargetStudentId(id); setActiveTab('payments'); }} />;
      case 'payments':
        return (
          <Payments 
            students={state.students} initialStudentId={targetStudentId || ''} user={user}
            onAddPayment={async (sid, amt, f, mon, comm) => {
              const res = await fetch('/api/payments', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ studentId: sid, amount: amt, forMonth: mon, comment: comm, type: 'income' }) });
              fetchData(); return await res.json();
            }} 
          />
        );
      case 'attendance':
        return <AttendancePage students={state.students} attendance={state.attendance} user={user} setAttendance={async (recs) => { await fetch('/api/attendance', { method: 'POST', headers: getHeaders(), body: JSON.stringify(recs) }); fetchData(); }} />;
      case 'grades':
        return <Grades students={state.students} grades={state.dailyGrades} attendance={state.attendance} user={user} setGrades={async (recs) => { await fetch('/api/grades', { method: 'POST', headers: getHeaders(), body: JSON.stringify(recs) }); fetchData(); }} />;
      case 'exams':
        return <Exams students={state.students} exams={state.exams} user={user} setExams={async (ex) => { await fetch('/api/exams', { method: 'POST', headers: getHeaders(), body: JSON.stringify(ex) }); fetchData(); }} />;
      case 'club':
        return (
          <ClubPage 
            students={state.students} clubMemberships={state.clubMemberships} clubAttendance={state.attendance} 
            clubGrades={state.dailyGrades} clubName={state.clubName} user={user}
            setClubAttendance={async (recs) => { await fetch('/api/attendance', { method: 'POST', headers: getHeaders(), body: JSON.stringify(recs) }); fetchData(); }}
            setClubGrades={async (recs) => { await fetch('/api/grades', { method: 'POST', headers: getHeaders(), body: JSON.stringify(recs) }); fetchData(); }}
            toggleMember={async (sid, isM) => { await fetch('/api/club/members', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ studentId: sid, isMember: isM }) }); fetchData(); }}
            updateClubName={async (name) => { await fetch('/api/club/config', { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ value: name }) }); fetchData(); }}
          />
        );
      case 'teachers':
        return <TeachersPage teachers={state.teachers} subjects={state.subjects} onAdd={async (t) => { await fetch('/api/teachers', { method: 'POST', headers: getHeaders(), body: JSON.stringify(t) }); fetchData(); }} onDelete={async (id) => { await fetch(`/api/teachers/${id}`, { method: 'DELETE', headers: getHeaders() }); fetchData(); }} />;
      case 'subjects':
        return <SubjectsPage subjects={state.subjects} onAdd={async (s) => { await fetch('/api/subjects', { method: 'POST', headers: getHeaders(), body: JSON.stringify(s) }); fetchData(); }} onDelete={async (id) => { await fetch(`/api/subjects/${id}`, { method: 'DELETE', headers: getHeaders() }); fetchData(); }} />;
      case 'settings':
        return <SettingsPage theme={theme} setTheme={setTheme} scale={scale} setScale={setScale} username={user.username} />;
      default: return <Dashboard state={state} user={user} />;
    }
  };

  return (
    <div className={`flex h-screen bg-[#020617] theme-${theme} scale-${scale}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} role={user.role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={user} activeTab={activeTab} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
