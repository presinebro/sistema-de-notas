import React, { useState } from 'react';
import { Course, Grade, Attendance } from '../types';
import { Book, Users, Calendar, PlusCircle } from 'lucide-react';

interface TeacherDashboardProps {
  courses: Course[];
  grades: Grade[];
  attendance: Attendance[];
  onSaveAttendance: (attendance: Attendance) => void;
  onSaveGrade: (grade: Partial<Grade>) => void;
}

export default function TeacherDashboard({
  courses,
  grades,
  attendance,
  onSaveAttendance,
  onSaveGrade,
}: TeacherDashboardProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getStudentAttendance = (courseId: string, studentId: string) => {
    return attendance.filter(a => 
      a.courseId === courseId && 
      a.studentId === studentId
    );
  };

  const getStudentGrades = (courseId: string, studentId: string) => {
    return grades.filter(g => 
      g.courseId === courseId && 
      g.studentId === studentId
    );
  };

  const calculateAttendancePercentage = (attendanceList: Attendance[]) => {
    if (attendanceList.length === 0) return 0;
    const present = attendanceList.filter(a => a.present).length;
    return (present / attendanceList.length) * 100;
  };

  const calculateAverageGrade = (gradesList: Grade[]) => {
    if (gradesList.length === 0) return 0;
    const sum = gradesList.reduce((acc, grade) => acc + grade.score, 0);
    return sum / gradesList.length;
  };

  const handleAttendanceToggle = (studentId: string, present: boolean) => {
    if (!selectedCourse) return;
    
    onSaveAttendance({
      id: Date.now().toString(),
      courseId: selectedCourse.id,
      studentId,
      date: selectedDate,
      present
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course)}
            className={`px-4 py-2 rounded-md flex items-center ${
              selectedCourse?.id === course.id
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Book className="h-4 w-4 mr-2" />
            {course.name}
          </button>
        ))}
      </div>

      {selectedCourse && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCourse.name} - Student List
            </h2>
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Today's Attendance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedCourse.enrolledStudents.map(studentId => {
                  const studentAttendance = getStudentAttendance(selectedCourse.id, studentId);
                  const studentGrades = getStudentGrades(selectedCourse.id, studentId);
                  const attendancePercentage = calculateAttendancePercentage(studentAttendance);
                  const averageGrade = calculateAverageGrade(studentGrades);
                  const todayAttendance = studentAttendance.find(a => a.date === selectedDate);

                  return (
                    <tr key={studentId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">
                            {attendancePercentage.toFixed(1)}%
                          </span>
                          <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                attendancePercentage >= 75
                                  ? 'bg-green-500'
                                  : attendancePercentage >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${attendancePercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${averageGrade >= 90 ? 'bg-green-100 text-green-800' :
                          averageGrade >= 80 ? 'bg-blue-100 text-blue-800' :
                          averageGrade >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                          {averageGrade.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAttendanceToggle(studentId, true)}
                            className={`px-2 py-1 rounded ${
                              todayAttendance?.present
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleAttendanceToggle(studentId, false)}
                            className={`px-2 py-1 rounded ${
                              todayAttendance?.present === false
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}