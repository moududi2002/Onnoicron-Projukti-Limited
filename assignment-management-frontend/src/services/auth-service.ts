import { apiClient } from './api-client';
import { LoginRequest, LoginResponse, RegisterRequest } from '@/types';

export const authService = {
  login: (data: LoginRequest) => apiClient.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => apiClient.post<LoginResponse>('/auth/register', data),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => apiClient.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) => apiClient.post('/auth/change-password', { currentPassword, newPassword }),
};