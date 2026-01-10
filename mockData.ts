
import { AppState } from './types';

// Fix: Added missing 'testResults' property to satisfy AppState interface requirements
export const initialMockState: AppState = {
  students: [],
  attendance: [],
  dailyGrades: [],
  exams: [],
  teachers: [],
  subjects: [],
  classes: [],
  clubMemberships: [],
  clubName: 'Cyber To\'garak',
  homework: [],
  clubAttendance: [],
  clubGrades: [],
  tests: [],
  testResults: []
};