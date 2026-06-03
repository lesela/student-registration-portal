import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, Student } from '../types';

export const authService = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/login', payload);
    return res.data;
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/register', payload);
    return res.data;
  },

  getMe: async (): Promise<Student> => {
    const res = await api.get<Student>('/api/auth/me');
    return res.data;
  },

  updateProfile: async (id: number, payload: { name: string; email: string }): Promise<Student> => {
    const res = await api.put<Student>(`/api/students/${id}`, {
      name: payload.name,
      email: payload.email,
      password: 'dummy' // needed by DTO
    });
    return res.data;
  }
};
