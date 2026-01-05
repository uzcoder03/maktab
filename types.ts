
export type Role = 'ADMIN' | 'TEACHER' | 'ACADEMIC';

export interface User {
  id: string;
  username: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  phone?: string;
  assignedGrades?: string[];
}

export interface Subject {
  id: string;
  subjectId: string;
  name: string;
  category: string;
  description?: string;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string;
  studentPhone?: string;
  parentPhone?: string;
  parentName?: string;
  monthlyFee: number;
  balance: number;
  isPaidThisMonth: boolean;
  lastChargeMonth?: string;
  hasFood?: boolean;
  hasTransport?: boolean;
  livingStatus?: 'home' | 'dormitory';
  address?: string;
  comment?: string;
  registrationDate?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
  comment?: string;
  subjectId?: string;
}

export interface DailyGrade {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  grade: number;
  comment?: string;
}

export interface Exam {
  id: string;
  studentId: string;
  subjectId: string;
  examName: string;
  date: string;
  score: number;
  comment?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  type: 'income' | 'charge';
  forMonth?: string;
  comment?: string;
}

export interface AppState {
  students: Student[];
  attendance: Attendance[];
  dailyGrades: DailyGrade[];
  exams: Exam[];
  teachers: User[];
  subjects: Subject[];
  clubMemberships: { studentId: string }[];
  clubName: string;
}
