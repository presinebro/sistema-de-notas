import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Grade, Course, User, Attendance } from '../types';

export const generatePDF = (grades: Grade[], courses: Course[], user: User) => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString();

  // Add header
  doc.setFontSize(20);
  doc.text('Academic Report', 105, 15, { align: 'center' });
  
  // Add student info
  doc.setFontSize(12);
  doc.text(`Student: ${user.name}`, 20, 30);
  doc.text(`ID: ${user.id}`, 20, 37);
  doc.text(`Date: ${currentDate}`, 20, 44);

  // Prepare grades data
  const gradesByCourse = grades.reduce((acc, grade) => {
    const course = courses.find(c => c.id === grade.courseId);
    if (!acc[grade.courseId]) {
      acc[grade.courseId] = {
        courseName: course?.name || 'Unknown Course',
        grades: [],
        average: 0
      };
    }
    acc[grade.courseId].grades.push(grade);
    return acc;
  }, {} as Record<string, { courseName: string; grades: Grade[]; average: number }>);

  // Calculate averages
  Object.values(gradesByCourse).forEach(courseData => {
    const sum = courseData.grades.reduce((acc, grade) => acc + grade.score, 0);
    courseData.average = sum / courseData.grades.length;
  });

  // Add grades table
  const tableData = Object.values(gradesByCourse).map(({ courseName, grades, average }) => [
    courseName,
    grades.map(g => g.score).join(', '),
    average.toFixed(1) + '%',
    getGradeStatus(average)
  ]);

  autoTable(doc, {
    head: [['Course', 'Grades', 'Average', 'Status']],
    body: tableData,
    startY: 55,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // Add summary
  const overallAverage = Object.values(gradesByCourse)
    .reduce((acc, { average }) => acc + average, 0) / Object.keys(gradesByCourse).length;

  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  doc.setFontSize(14);
  doc.text('Summary', 20, finalY + 20);
  
  doc.setFontSize(12);
  doc.text(`Overall Average: ${overallAverage.toFixed(1)}%`, 20, finalY + 30);
  doc.text(`Academic Standing: ${getAcademicStanding(overallAverage)}`, 20, finalY + 40);

  // Save the PDF
  doc.save(`academic-report-${user.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

const getGradeStatus = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Satisfactory';
  return 'Needs Improvement';
};

const getAcademicStanding = (average: number): string => {
  if (average >= 90) return 'Dean\'s List';
  if (average >= 80) return 'Good Standing';
  if (average >= 70) return 'Satisfactory';
  return 'Academic Probation';
};