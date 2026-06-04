import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import type { Student } from '../types';

interface AuthContextType {
  student: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string, student: Student) => void;
  logout: () => void;
  updateStudent: (student: Student) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (jwtToken: string, studentData: Student) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('student', JSON.stringify(studentData));
    setToken(jwtToken);
    setStudent(studentData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    setToken(null);
    setStudent(null);
  };

  const updateStudent = (studentData: Student) => {
    localStorage.setItem('student', JSON.stringify(studentData));
    setStudent(studentData);
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }
    try {
      setToken(savedToken);
      const res = await api.get<Student>('/api/auth/me');
      setStudent(res.data);
      localStorage.setItem('student', JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to load user profile on startup", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        student,
        token,
        isAuthenticated: !!token,
        isAdmin: student?.role === 'ADMIN',
        isLoading,
        login,
        logout,
        updateStudent,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
