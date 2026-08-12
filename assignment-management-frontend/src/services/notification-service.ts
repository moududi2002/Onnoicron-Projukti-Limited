import { apiClient } from './api-client';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getAll: () => apiClient.get<Notification[]>('/notification'),
  markAsRead: (id: string) => apiClient.put(`/notification/${id}/read`, {}),
  markAllAsRead: () => apiClient.put('/notification/read-all', {}),
  getUnreadCount: () => apiClient.get<{ count: number }>('/notification/unread-count'),
  delete: (id: string) => apiClient.delete(`/notification/${id}`),
};