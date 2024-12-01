import React from 'react';
import { Course, User } from '../types';
import { Book, CheckCircle, XCircle } from 'lucide-react';

interface CourseEnrollmentProps {
  courses: Course[];
  currentUser: User;
  onEnroll: (courseId: string) => void;
}

export default function CourseEnrollment({ courses, currentUser, onEnroll }: CourseEnrollmentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const isEnrolled = course.enrolledStudents.includes(currentUser.id);
          const isFull = course.enrolledStudents.length >= course.capacity;
          const canEnroll = currentUser.role === 'student' && !isFull;

          return (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Book className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                </div>
                {isEnrolled && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  Semester: {course.semester} {course.year}
                </p>
                <p className="text-sm text-gray-600">
                  Capacity: {course.enrolledStudents.length} / {course.capacity}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      isFull ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${(course.enrolledStudents.length / course.capacity) * 100}%`
                    }}
                  />
                </div>
              </div>
              {canEnroll && (
                <button
                  onClick={() => onEnroll(course.id)}
                  className={`mt-4 w-full px-4 py-2 rounded-md text-sm font-medium ${
                    isEnrolled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {isEnrolled ? 'Drop Course' : 'Enroll'}
                </button>
              )}
              {isFull && !isEnrolled && (
                <div className="mt-4 flex items-center justify-center text-sm text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  Course is full
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}