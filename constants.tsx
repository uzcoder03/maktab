
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  GraduationCap, 
  FileSpreadsheet,
  Zap,
  User,
  BookOpen,
  Briefcase,
  CreditCard,
  AlertTriangle,
  PhoneCall,
  LayoutGrid,
  ShieldAlert,
  Star,
  ClipboardList
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'TEACHER', 'ACADEMIC', 'STUDENT'] },
  { id: 'profile', label: 'Profil', icon: <User size={20} />, roles: ['ADMIN', 'TEACHER', 'ACADEMIC', 'STUDENT'] },
  
  // O'quvchi uchun maxsus
  { id: 'my-grades', label: 'Mening Baholarim', icon: <Star size={20} />, roles: ['STUDENT'] },
  { id: 'my-tests', label: 'Imtihonlar', icon: <ShieldAlert size={20} />, roles: ['STUDENT'] },

  // Admin/Xodimlar uchun
  { id: 'students', label: 'O\'quvchilar Bazasi', icon: <Users size={20} />, roles: ['ADMIN', 'ACADEMIC'] }, 
  { id: 'absent-calls', label: 'Davomat Nazorati', icon: <PhoneCall size={20} />, roles: ['ADMIN', 'ACADEMIC'] },
  { id: 'debtors', label: 'Qarzdorlar Monitoringi', icon: <AlertTriangle size={20} />, roles: ['ADMIN', 'ACADEMIC'] },
  { id: 'payments', label: 'To\'lovlar', icon: <CreditCard size={20} />, roles: ['ADMIN', 'ACADEMIC'] },
  { id: 'attendance', label: 'Davomat', icon: <CalendarCheck size={20} />, roles: ['ADMIN', 'TEACHER'] },
  { id: 'grades', label: 'Kunlik Baholar', icon: <FileSpreadsheet size={20} />, roles: ['ADMIN', 'TEACHER'] },
  { id: 'exams', label: 'Imtihonlar', icon: <GraduationCap size={20} />, roles: ['ADMIN', 'TEACHER'] },
  { id: 'tests', label: 'Test Markazi', icon: <ShieldAlert size={20} />, roles: ['ADMIN', 'TEACHER'] },
  { id: 'club', label: 'Kiber To\'garak', icon: <Zap size={20} />, roles: ['ADMIN', 'TEACHER'] },
  { id: 'teachers', label: 'Xodimlar', icon: <Briefcase size={20} />, roles: ['ADMIN'] },
  { id: 'subjects', label: 'Fanlar', icon: <BookOpen size={20} />, roles: ['ADMIN'] },
  { id: 'classes', label: 'Sinflar', icon: <LayoutGrid size={20} />, roles: ['ADMIN'] },
];

export const CLASSES = ['1-A', '1-B', '2-A', '2-B', '3-A', '3-B', '4-A', '5-A', '6-A', '7-A', '8-A', '9-A', '10-A', '11-A'];

export const STORAGE_KEYS = {
  STATE: 'educontrol_state',
  USER: 'educontrol_user',
  TOKEN: 'token'
};
