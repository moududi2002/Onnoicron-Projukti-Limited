import { apiClient } from './api-client';
import { Submission, CreateSubmissionDto, GradeSubmissionDto } from '@/types';

export const submissionService = {
  getById: (id: string) => apiClient.get<Submission>(`/submission/${id}`),
  create: (data: CreateSubmissionDto) => apiClient.post<Submission>('/submission', data),
  update: (id: string, data: any) => apiClient.put<Submission>(`/submission/${id}`, data),
  grade: (id: string, data: GradeSubmissionDto) => apiClient.put<Submission>(`/submission/${id}/grade`, data),
  getByAssignment: (assignmentId: string, params?: any) => apiClient.get<any>(`/submission/assignment/${assignmentId}?${new URLSearchParams(params).toString()}`),
  getMySubmissions: () => apiClient.get<Submission[]>('/submission/student'),
  checkSubmitted: (assignmentId: string) => apiClient.get<{ hasSubmitted: boolean }>(`/submission/check/${assignmentId}`),
};