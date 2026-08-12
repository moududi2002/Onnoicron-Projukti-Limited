import { apiClient } from './api-client';

interface SubjectDto { id: string; name: string; code: string; classId: string; className?: string; isActive: boolean; teacherCount: number; }

export const subjectService = {
  getAll: (params?: Record<string, any>) => apiClient.get<any>(`/subject?${new URLSearchParams(params).toString()}`),
  getById: (id: string) => apiClient.get<SubjectDto>(`/subject/${id}`),
  create: (data: any) => apiClient.post<SubjectDto>('/subject', data),
  update: (id: string, data: any) => apiClient.put<SubjectDto>(`/subject/${id}`, data),
  delete: (id: string) => apiClient.delete(`/subject/${id}`),
  getByClass: (classId: string) => apiClient.get<SubjectDto[]>(`/subject/class/${classId}`),
};