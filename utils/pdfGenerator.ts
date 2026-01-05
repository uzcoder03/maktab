
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Student, DailyGrade, Exam, Attendance, Subject } from '../types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateStudentPassportPDF = (
  student: Student,
  grades: DailyGrade[],
  exams: Exam[],
  attendance: Attendance[],
  subjects: Subject[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Background
  doc.setFillColor(2, 6, 23); // Deep Slate
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Title
  doc.setTextColor(34, 211, 238); // Cyan
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("CYBERSHIELD ACADEMIC PASSPORT", 15, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`ID: ${student.studentId} | GRADE: ${student.grade}`, 15, 35);
  doc.text(`DATE GENERATED: ${new Date().toLocaleDateString()}`, 15, 42);

  // Student Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(`${student.firstName} ${student.lastName}`, 15, 65);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Parent: ${student.parentName || 'N/A'}`, 15, 72);
  doc.text(`Phone: ${student.parentPhone || 'N/A'}`, 15, 77);
  doc.text(`Address: ${student.address || 'N/A'}`, 15, 82);

  // Stats Summary
  const avgGrade = grades.length > 0 ? (grades.reduce((a, b) => a + b.grade, 0) / grades.length).toFixed(1) : 'N/A';
  const attendanceRate = attendance.length > 0 ? `${Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)}%` : 'N/A';

  doc.autoTable({
    startY: 90,
    head: [['OVERALL RATING', 'ATTENDANCE RATE', 'TOTAL EXAMS']],
    body: [[avgGrade, attendanceRate, exams.length]],
    theme: 'grid',
    headStyles: { fillColor: [34, 211, 238], textColor: 0, fontStyle: 'bold' },
  });

  // Daily Grades Table
  doc.setFontSize(14);
  doc.text("DAILY GRADES (BY SUBJECT)", 15, (doc as any).lastAutoTable.finalY + 15);
  
  const gradeRows = subjects.map(sub => {
    const subGrades = grades.filter(g => g.subjectId === sub.subjectId);
    const gradeStr = subGrades.map(g => `${g.grade} (${g.date.split('-').slice(1).join('/')})`).join(', ');
    return [sub.name, gradeStr || 'No grades yet'];
  });

  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Subject', 'Grades with Dates']],
    body: gradeRows,
    theme: 'striped',
    headStyles: { fillColor: [2, 6, 23] },
    columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 1: { fontSize: 8 } }
  });

  // Exams Table
  doc.setFontSize(14);
  doc.text("EXAM PERFORMANCE", 15, (doc as any).lastAutoTable.finalY + 15);

  const examRows = exams.map(ex => {
    const sub = subjects.find(s => s.subjectId === ex.subjectId);
    return [sub?.name || 'Unknown', ex.examName, ex.score, ex.date];
  });

  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Subject', 'Exam Name', 'Score', 'Date']],
    body: examRows,
    theme: 'grid',
    headStyles: { fillColor: [129, 140, 248] },
  });

  // Attendance Summary Section
  doc.setFontSize(14);
  doc.text("LOGISTICS & STATUS", 15, (doc as any).lastAutoTable.finalY + 15);
  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    body: [
      ['Logistics:', `Food: ${student.hasFood ? 'YES' : 'NO'} | Transport: ${student.hasTransport ? 'YES' : 'NO'}`],
      ['Housing:', student.livingStatus === 'dormitory' ? 'Dormitory (Yotoqxona)' : 'Home (Uyidan)'],
      ['Monthly Fee:', `${student.monthlyFee?.toLocaleString()} UZS`]
    ],
    theme: 'plain',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
  });

  doc.save(`${student.studentId}_Passport.pdf`);
};

// Placeholder functions to keep compatibility
export const generateDebtorsReportPDF = (...args: any[]) => {};
export const generateMasterReportPDF = (...args: any[]) => {};
export const generatePaymentReceiptPDF = (...args: any[]) => {};
export const generateFinancialHistoryPDF = (...args: any[]) => {};
export const generateClubReportPDF = (...args: any[]) => {};
export const generateClubOverallReportPDF = (...args: any[]) => {};
