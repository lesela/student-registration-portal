import api from './api';
import type { Registration } from '../types';

export const registrationService = {
  registerCourse: async (courseId: number, studentId?: number): Promise<Registration> => {
    const res = await api.post<Registration>('/api/registrations', {
      studentId,
      courseId
    });
    return res.data;
  },

  getRegistrations: async (studentId: number): Promise<Registration[]> => {
    const res = await api.get<Registration[]>(`/api/registrations/student/${studentId}`);
    return res.data;
  },

  unregister: async (registrationId: number): Promise<void> => {
    await api.delete(`/api/registrations/${registrationId}`);
  },

  unregisterByCourse: async (studentId: number, courseId: number): Promise<void> => {
    await api.delete(`/api/registrations/student/${studentId}/course/${courseId}`);
  }
};
