import { apiClient } from './api-client';
import { Assignment, CreateAssignmentDto, UpdateAssignmentDto, PaginatedResponse } from '@/types';

export const assignmentService = {
  getAll: (params?: Record<string, any>) => apiClient.get<PaginatedResponse<Assignment>>(`/assignment?${new URLSearchParams(params).toString()}`),
  getById: (id: string) => apiClient.get<Assignment>(`/assignment/${id}`),
  create: (data: CreateAssignmentDto) => apiClient.post<Assignment>('/assignment', data),
  update: (id: string, data: UpdateAssignmentDto) => apiClient.put<Assignment>(`/assignment/${id}`, data),
  delete: (id: string) => apiClient.delete(`/assignment/${id}`),
  publish: (id: string) => apiClient.post<Assignment>(`/assignment/${id}/publish`, {}),
  getStudentAssignments: () => apiClient.get<Assignment[]>('/assignment/student'),
  getTeacherAssignments: () => apiClient.get<Assignment[]>('/assignment/teacher'),
};