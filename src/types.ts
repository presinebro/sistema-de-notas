export type Role = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  semester: string;
  year: number;
  capacity: number;
  enrolledStudents: string[];
}

export interface Enrollment {
  studentId: string;
  courseId: string;
  enrolledAt: string;
}

export interface Attendance {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  present: boolean;
}