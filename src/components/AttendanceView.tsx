import React from 'react';
import { Attendance, Course } from '../types';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

interface AttendanceViewProps {
  attendance: Attendance[];
  courses: Course[];
}

export default function AttendanceView({ attendance, courses }: AttendanceViewProps) {
  const attendanceByCourse = attendance.reduce((acc, curr) => {
    if (!acc[curr.courseId]) {
      acc[curr.courseId] = [];
    }
    acc[curr.courseId].push(curr);
    return acc;
  }, {} as Record<string, Attendance[]>);

  const calculateAttendancePercentage = (courseAttendance: Attendance[]) => {
    const totalClasses = courseAttendance.length;
    const presentClasses = courseAttendance.filter(a => a.present).length;
    return (presentClasses / totalClasses) * 100;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Attendance Record</h2>
      {Object.entries(attendanceByCourse).map(([courseId, courseAttendance]) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return null;

        const attendancePercentage = calculateAttendancePercentage(courseAttendance);

        return (
          <div key={courseId} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
              </div>
              <div className="text-sm font-medium">
                Attendance: {attendancePercentage.toFixed(1)}%
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
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

            <div className="space-y-2">
              {courseAttendance
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center">
                      {record.present ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className="text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        record.present ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {record.present ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}