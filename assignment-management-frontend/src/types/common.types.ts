import { ReactNode } from 'react';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface LayoutProps {
  children: ReactNode;
}

export interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  totalClasses: number;
  activeClasses?: number;
  totalSubjects: number;
  activeSubjects?: number;
  totalAssignments: number;
  publishedAssignments?: number;
  draftAssignments?: number;
  closedAssignments?: number;
  totalSubmissions: number;
  submittedOnTime?: number;
  lateSubmissions?: number;
  pendingGrading: number;
  gradedSubmissions?: number;
  averageGrade: number;
  highestGrade?: number;
  lowestGrade?: number;
  passPercentage?: number;
  submissionRate?: number;
  gradingRate?: number;
  onTimeSubmissionRate?: number;
  recentActivities: RecentActivity[];
  upcomingDeadlines?: UpcomingDeadline[];
  overdueAssignments?: number;
  totalFilesUploaded?: number;
  lastActivityDate?: string;
}

export interface RecentActivity {
  id: string;
  activityType: string;
  description: string;
  userName: string;
  userRole?: string;
  timestamp: string;
  timeAgo?: string;
}

export interface UpcomingDeadline {
  assignmentId: string;
  assignmentTitle: string;
  subjectName: string;
  className: string;
  deadline: string;
  totalStudents: number;
  submittedCount: number;
  remainingCount?: number;
  submissionRate?: number;
  timeRemaining?: string;
  isUrgent?: boolean;
  isOverdue?: boolean;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
  category?: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'draft' | 'published' | 'archived';