import { apiClient } from './api-client';
import { User, CreateUserDto, UpdateUserDto, PaginatedResponse } from '@/types';

export const userService = {
  getAll: (params?: Record<string, any>) => apiClient.get<PaginatedResponse<User>>(`/user?${new URLSearchParams(params).toString()}`),
  getById: (id: string) => apiClient.get<User>(`/user/${id}`),
  create: (data: CreateUserDto) => apiClient.post<User>('/user', data),
  update: (id: string, data: UpdateUserDto) => apiClient.put<User>(`/user/${id}`, data),
  delete: (id: string) => apiClient.delete(`/user/${id}`),
  getTeachers: () => apiClient.get<User[]>('/user/teachers'),
  getStudents: () => apiClient.get<User[]>('/user/students'),
};