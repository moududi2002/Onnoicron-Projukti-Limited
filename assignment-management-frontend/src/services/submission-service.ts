import { apiClient } from './api-client';
import { Submission, CreateSubmissionDto, GradeSubmissionDto, PaginatedResponse } from '@/types';

export const submissionService = {
  getById: (id: string) => apiClient.get<Submission>(`/submission/${id}`),
  create: (data: CreateSubmissionDto) => apiClient.post<Submission>('/submission', data),
  update: (id: string, data: any) => apiClient.put<Submission>(`/submission/${id}`, data),
  grade: (id: string, data: GradeSubmissionDto) => apiClient.put<Submission>(`/submission/${id}/grade`, data),
  getByAssignment: (assignmentId: string, params?: any) => 
    apiClient.get<PaginatedResponse<Submission>>(`/submission/assignment/${assignmentId}?${new URLSearchParams(params).toString()}`),
  getMySubmissions: () => apiClient.get<Submission[]>('/submission/student'),
  getAll: (params?: any) => 
    apiClient.get<PaginatedResponse<Submission>>(`/submission?${new URLSearchParams(params).toString()}`),
  checkSubmitted: (assignmentId: string) => 
    apiClient.get<{ hasSubmitted: boolean }>(`/submission/check/${assignmentId}`),
};