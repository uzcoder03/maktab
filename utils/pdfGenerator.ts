
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Student, DailyGrade, Exam, Attendance, Subject, Payment } from '../types';

const BRAND_NAME = "VELMOR IT SCHOOL";
const BRAND_PRIMARY = [34, 211, 238]; // Cyan
const BRAND_DARK = [2, 6, 23]; // Dark Slate

export const generateStudentPassportPDF = (
  student: Student,
  grades: DailyGrade[],
  exams: Exam[],
  attendance: Attendance[],
  subjects: Subject[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2]);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(`${BRAND_NAME} PASSPORT`, 15, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`ID: ${student.studentId} | GRADE: ${student.grade}`, 15, 35);
  doc.text(`DATE GENERATED: ${new Date().toLocaleDateString()}`, 15, 42);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(`${student.firstName} ${student.lastName}`, 15, 65);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Parent: ${student.parentName || 'N/A'}`, 15, 72);
  doc.text(`Phone: ${student.parentPhone || 'N/A'}`, 15, 77);
  doc.text(`Address: ${student.address || 'N/A'}`, 15, 82);

  const avgGrade = grades.length > 0 ? (grades.reduce((a, b) => a + b.grade, 0) / grades.length).toFixed(1) : 'N/A';
  const attendanceRate = attendance.length > 0 ? `${Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)}%` : 'N/A';

  (doc as any).autoTable({
    startY: 90,
    head: [['OVERALL RATING', 'ATTENDANCE RATE', 'TOTAL EXAMS']],
    body: [[avgGrade, attendanceRate, exams.length]],
    theme: 'grid',
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 0, fontStyle: 'bold' },
  });

  doc.setFontSize(14);
  doc.text("DAILY GRADES (BY SUBJECT)", 15, (doc as any).lastAutoTable.finalY + 15);
  
  const gradeRows = subjects.map(sub => {
    const subGrades = grades.filter(g => g.subjectId === sub.subjectId);
    const gradeStr = subGrades.map(g => `${g.grade} (${g.date.split('-').slice(1).join('/')})`).join(', ');
    return [sub.name, gradeStr || 'No grades yet'];
  });

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Subject', 'Grades with Dates']],
    body: gradeRows,
    theme: 'striped',
    headStyles: { fillColor: BRAND_DARK },
    columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 1: { fontSize: 8 } }
  });

  doc.save(`${student.studentId}_Passport.pdf`);
};

export const generatePaymentReceiptPDF = (
  student: Student,
  amount: number,
  isFinal: boolean,
  operator: string,
  forMonth?: string
) => {
  const doc = new jsPDF({ format: [80, 150] }); // 80mm width for receipt printer feel
  const pageWidth = doc.internal.pageSize.getWidth();
  const date = new Date().toLocaleString();

  // Logo & Header
  doc.setFillColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("VELMOR RECEIPT", pageWidth / 2, 12, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text("IT School Control Center", pageWidth / 2, 18, { align: 'center' });

  // Body
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text("TRANS. DETAILS", 10, 35);
  doc.setLineWidth(0.1);
  doc.line(10, 37, pageWidth - 10, 37);

  doc.setFontSize(8);
  doc.text(`Date: ${date}`, 10, 45);
  doc.text(`Student: ${student.firstName} ${student.lastName}`, 10, 52);
  doc.text(`ID: ${student.studentId}`, 10, 59);
  doc.text(`Month: ${forMonth || 'General Payment'}`, 10, 66);

  // Amount
  doc.setFillColor(241, 245, 249);
  doc.rect(10, 75, pageWidth - 20, 15, 'F');
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`AMOUNT: ${amount.toLocaleString()} UZS`, pageWidth / 2, 85, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Current Balance: ${student.balance.toLocaleString()} UZS`, 10, 100);
  doc.text(`Operator: ${operator}`, 10, 107);

  // Footer
  doc.setLineDash([1, 1]);
  doc.line(10, 120, pageWidth - 10, 120);
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for choosing VELMOR IT SCHOOL!", pageWidth / 2, 130, { align: 'center' });
  doc.text("Scan to verify: velmor.io/audit", pageWidth / 2, 135, { align: 'center' });

  doc.save(`Receipt_${student.studentId}_${Date.now()}.pdf`);
};

export const generateFinancialHistoryPDF = (
  student: Student,
  payments: Payment[],
  operator: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Branding Header
  doc.setFillColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2]);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MOLIYAVIY HISOBOT", 15, 25);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`STUDENT: ${student.firstName} ${student.lastName} | ID: ${student.studentId}`, 15, 35);

  // Stats Card
  const totalIncome = payments.filter(p => p.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalCharge = payments.filter(p => p.type === 'charge').reduce((a, b) => a + b.amount, 0);

  (doc as any).autoTable({
    startY: 55,
    head: [['JAMI TO\'LOVLAR', 'JAMI QARZDORLIK', 'JORIY BALANS']],
    body: [[
      `${totalIncome.toLocaleString()} UZS`, 
      `${totalCharge.toLocaleString()} UZS`, 
      `${student.balance.toLocaleString()} UZS`
    ]],
    theme: 'grid',
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 0 },
  });

  // Detailed History Table
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("BATAFSIL TRANZAKSIYALAR", 15, (doc as any).lastAutoTable.finalY + 15);

  const rows = payments.map(p => [
    new Date(p.date).toLocaleDateString(),
    p.type === 'income' ? 'KIRIM' : 'QARZ',
    p.forMonth || '-',
    `${p.amount.toLocaleString()} UZS`,
    p.comment || '-'
  ]);

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Sana', 'Tur', 'Oy', 'Summa', 'Izoh']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: BRAND_DARK },
    columnStyles: { 
      1: { fontStyle: 'bold' },
      3: { halign: 'right', fontStyle: 'bold' } 
    },
    didDrawCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 1) {
        if (data.cell.text[0] === 'KIRIM') {
          doc.setTextColor(16, 185, 129); // Emerald
        } else {
          doc.setTextColor(244, 63, 94); // Rose
        }
      }
    }
  });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Tuzuvchi: ${operator} | Chop etilgan vaqt: ${new Date().toLocaleString()}`, 15, doc.internal.pageSize.getHeight() - 10);

  doc.save(`Moliya_${student.studentId}.pdf`);
};

export const generateDebtorsReportPDF = (...args: any[]) => {};
export const generateMasterReportPDF = (...args: any[]) => {};
export const generateClubReportPDF = (...args: any[]) => {};
export const generateClubOverallReportPDF = (...args: any[]) => {};
