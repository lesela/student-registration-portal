import api from './api';
import type { Registration } from '../types';

export interface AdminStudent {
  id: number;
  name: string;
  email: string;
  role: string;
  registrationCount: number;
}

export const adminService = {
  getAllStudents: async (): Promise<AdminStudent[]> => {
    const res = await api.get<AdminStudent[]>('/api/admin/students');
    return res.data;
  },

  getAllRegistrations: async (): Promise<Registration[]> => {
    const res = await api.get<Registration[]>('/api/registrations/all');
    return res.data;
  },

  deleteStudent: async (studentId: number): Promise<void> => {
    await api.delete(`/api/admin/students/${studentId}`);
  },

  dropRegistration: async (registrationId: number): Promise<void> => {
    await api.delete(`/api/registrations/${registrationId}`);
  },
};
