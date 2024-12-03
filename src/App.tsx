import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import GradesList from './components/GradesList';
import GradeEditor from './components/GradeEditor';
import CourseEnrollment from './components/CourseEnrollment';
import AttendanceView from './components/AttendanceView';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Grade, Course, Attendance, User } from './types';
import { LogOut, GraduationCap } from 'lucide-react';

const DEMO_COURSES: Course[] = [
  { 
    id: '1', 
    name: 'Mathematics 101', 
    teacherId: '2', 
    semester: 'Fall', 
    year: 2024,
    capacity: 30,
    enrolledStudents: ['3']
  },
  { 
    id: '2', 
    name: 'Physics 101', 
    teacherId: '2', 
    semester: 'Fall', 
    year: 2024,
    capacity: 25,
    enrolledStudents: []
  },
];

const DEMO_GRADES: Grade[] = [
  {
    id: '1',
    studentId: '3',
    courseId: '1',
    score: 85,
    feedback: 'Good work on derivatives!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEMO_ATTENDANCE: Attendance[] = [
  {
    id: '1',
    courseId: '1',
    studentId: '3',
    date: '2024-03-01',
    present: true
  },
  {
    id: '2',
    courseId: '1',
    studentId: '3',
    date: '2024-03-04',
    present: true
  },
  {
    id: '3',
    courseId: '1',
    studentId: '3',
    date: '2024-03-06',
    present: false
  }
];

function Dashboard() {
  const { user, logout, users, addUser, removeUser } = useAuth();
  const [grades, setGrades] = React.useState<Grade[]>(() => {
    const stored = localStorage.getItem('grades');
    return stored ? JSON.parse(stored) : DEMO_GRADES;
  });
  const [courses, setCourses] = React.useState<Course[]>(() => {
    const stored = localStorage.getItem('courses');
    return stored ? JSON.parse(stored) : DEMO_COURSES;
  });
  const [attendance, setAttendance] = React.useState<Attendance[]>(() => {
    const stored = localStorage.getItem('attendance');
    return stored ? JSON.parse(stored) : DEMO_ATTENDANCE;
  });
  const [editingGrade, setEditingGrade] = React.useState<Grade | null>(null);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'grades' | 'courses' | 'attendance' | 'teacher' | 'admin'>('grades');

  React.useEffect(() => {
    localStorage.setItem('grades', JSON.stringify(grades));
    localStorage.setItem('courses', JSON.stringify(courses));
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [grades, courses, attendance]);

  const teachers = users.filter(u => u.role === 'teacher');

  const visibleGrades = grades.filter(grade => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'teacher') {
      const course = courses.find(c => c.id === grade.courseId);
      return course?.teacherId === user.id;
    }
    return grade.studentId === user?.id;
  });

  const handleSaveGrade = (gradeData: Partial<Grade>) => {
    if (editingGrade) {
      setGrades(grades.map(g => 
        g.id === editingGrade.id 
          ? { ...editingGrade, ...gradeData, updatedAt: new Date().toISOString() } 
          : g
      ));
    } else {
      const newGrade: Grade = {
        id: Date.now().toString(),
        studentId: gradeData.studentId!,
        courseId: gradeData.courseId!,
        score: gradeData.score!,
        feedback: gradeData.feedback,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGrades([...grades, newGrade]);
    }
    setIsEditorOpen(false);
    setEditingGrade(null);
  };

  const handleDeleteGrade = (gradeId: string) => {
    if (confirm('Are you sure you want to delete this grade?')) {
      setGrades(grades.filter(g => g.id !== gradeId));
    }
  };

  const handleEnrollment = (courseId: string) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        const isEnrolled = course.enrolledStudents.includes(user!.id);
        if (isEnrolled) {
          // Check if there are any grades or attendance records before allowing drop
          const hasGrades = grades.some(g => g.courseId === courseId && g.studentId === user!.id);
          const hasAttendance = attendance.some(a => a.courseId === courseId && a.studentId === user!.id);
          
          if (hasGrades || hasAttendance) {
            alert('Cannot drop course: You have existing grades or attendance records.');
            return course;
          }
        }
        
        return {
          ...course,
          enrolledStudents: isEnrolled
            ? course.enrolledStudents.filter(id => id !== user!.id)
            : [...course.enrolledStudents, user!.id]
        };
      }
      return course;
    }));
  };

  const handleSaveAttendance = (attendanceData: Attendance) => {
    setAttendance(prev => {
      const existingIndex = prev.findIndex(
        a => a.courseId === attendanceData.courseId && 
             a.studentId === attendanceData.studentId && 
             a.date === attendanceData.date
      );

      if (existingIndex >= 0) {
        return prev.map((a, i) => i === existingIndex ? attendanceData : a);
      }
      return [...prev, { ...attendanceData, id: Date.now().toString() }];
    });
  };

  const handleAddTeacher = (teacherData: Omit<User, 'id'>) => {
    addUser({
      ...teacherData,
      id: Date.now().toString(),
    });
  };

  const handleAddCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: Date.now().toString(),
    };
    setCourses([...courses, newCourse]);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This will also delete all associated grades and attendance records.')) {
      setCourses(courses.filter(c => c.id !== courseId));
      setGrades(grades.filter(g => g.courseId !== courseId));
      setAttendance(attendance.filter(a => a.courseId !== courseId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Academic System</h1>
                <p className="text-sm text-gray-500">
                  Logged in as {user?.name} ({user?.role})
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'grades'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Grades
            </button>
            {user?.role === 'student' && (
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'courses'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Courses
              </button>
            )}
            {user?.role === 'student' && (
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'attendance'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Attendance
              </button>
            )}
            {user?.role === 'teacher' && (
              <button
                onClick={() => setActiveTab('teacher')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'teacher'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                My Courses
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'admin'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Administration
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'grades' && (
          <GradesList
            grades={visibleGrades}
            courses={courses}
            currentUser={user!}
            onEdit={(grade) => {
              setEditingGrade(grade);
              setIsEditorOpen(true);
            }}
            onDelete={handleDeleteGrade}
            onAdd={() => {
              setEditingGrade(null);
              setIsEditorOpen(true);
            }}
          />
        )}

        {activeTab === 'courses' && user?.role === 'student' && (
          <CourseEnrollment
            courses={courses}
            currentUser={user!}
            onEnroll={handleEnrollment}
          />
        )}

        {activeTab === 'attendance' && user?.role === 'student' && (
          <AttendanceView
            attendance={attendance.filter(a => a.studentId === user.id)}
            courses={courses}
          />
        )}

        {activeTab === 'teacher' && user?.role === 'teacher' && (
          <TeacherDashboard
            courses={courses.filter(c => c.teacherId === user.id)}
            grades={grades}
            attendance={attendance}
            onSaveAttendance={handleSaveAttendance}
            onSaveGrade={handleSaveGrade}
          />
        )}

        {activeTab === 'admin' && user?.role === 'admin' && (
          <AdminDashboard
            teachers={teachers}
            courses={courses}
            onAddTeacher={handleAddTeacher}
            onDeleteTeacher={removeUser}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        )}
      </main>

      {isEditorOpen && (
        <GradeEditor
          grade={editingGrade}
          courses={courses.filter(c => 
            user?.role === 'admin' || 
            (user?.role === 'teacher' && c.teacherId === user.id)
          )}
          onSave={handleSaveGrade}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingGrade(null);
          }}
        />
      )}
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}