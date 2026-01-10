
export type Role = 'ADMIN' | 'TEACHER' | 'ACADEMIC' | 'STUDENT';

export interface User {
  id: string;
  username: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  phone?: string;
  assignedGrades?: string[];
  grade?: string;
  mustChangePassword?: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number; // Har bir savol uchun individual (ixtiyoriy)
}

export interface Test {
  id: string;
  title: string;
  subjectId: string;
  grade: string;
  questions: Question[];
  isActive: boolean;
  totalTimeLimit: number; // Umumiy vaqt daqiqada
  antiCheatEnabled: boolean; // Anti-cheat yoqilganmi yoki yo'q
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  score: number;
  status: 'passed' | 'failed' | 'cheated';
  date: string;
}

export interface SchoolClass {
  id: string;
  classId: string;
  name: string;
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
  registrationDate?: string;
  livingStatus?: 'home' | 'dormitory';
  address?: string;
  hasFood?: boolean;
  hasTransport?: boolean;
  comment?: string;
}

export interface AppState {
  students: Student[];
  attendance: Attendance[];
  dailyGrades: DailyGrade[];
  homework: Homework[];
  exams: Exam[];
  teachers: User[];
  subjects: Subject[];
  classes: SchoolClass[];
  clubMemberships: any[];
  clubName: string;
  clubAttendance: Attendance[];
  clubGrades: DailyGrade[];
  tests: Test[];
  testResults: TestResult[];
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

export interface Homework {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  date: string;
  status: 'done' | 'not_done';
  comment?: string;
}

export interface Exam {
  id: string;
  studentId: string;
  subjectId: string;
  examName: string;
  date: string;
  score: number;
}
