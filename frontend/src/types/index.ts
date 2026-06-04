export interface Student {
  id: number;
  name: string;
  email: string;
  totalCredits: number;
  role: 'ADMIN' | 'STUDENT';
}

export interface Course {
  id: number;
  name: string;
  code: string;
  department: string;
  instructor: string;
  credits: number;
  capacity: number;
  enrolledStudents: number;
  day: string;
  startTime: string; // e.g. "10:00:00"
  endTime: string;   // e.g. "12:00:00"
}

export interface Registration {
  id: number;
  studentId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  registeredAt: string;
  course?: Course;
}

export interface AuthState {
  token: string | null;
  student: Student | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  student: Student;
}
