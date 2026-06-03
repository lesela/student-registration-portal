import api from './api';
import type { Course } from '../types';

export const courseService = {
  getCourses: async (params?: {
    query?: string;
    department?: string;
    credits?: number;
    availableOnly?: boolean;
  }): Promise<Course[]> => {
    const res = await api.get<Course[]>('/api/courses', { params });
    return res.data;
  },

  getCourse: async (id: number): Promise<Course> => {
    const res = await api.get<Course>(`/api/courses/${id}`);
    return res.data;
  }
};
