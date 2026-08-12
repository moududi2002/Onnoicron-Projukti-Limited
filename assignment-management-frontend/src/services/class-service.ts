import { apiClient } from './api-client';

interface ClassDto { id: string; name: string; description?: string; academicYear: string; isActive: boolean; studentCount: number; subjectCount: number; }

export const classService = {
  getAll: (params?: Record<string, any>) => apiClient.get<any>(`/class?${new URLSearchParams(params).toString()}`),
  getById: (id: string) => apiClient.get<ClassDto>(`/class/${id}`),
  create: (data: any) => apiClient.post<ClassDto>('/class', data),
  update: (id: string, data: any) => apiClient.put<ClassDto>(`/class/${id}`, data),
  delete: (id: string) => apiClient.delete(`/class/${id}`),
  getActive: () => apiClient.get<ClassDto[]>('/class/active'),
};