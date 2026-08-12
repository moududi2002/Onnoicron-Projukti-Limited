import { Attachment } from './file.types';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  maximumMarks: number;
  status: 'Draft' | 'Published' | 'Closed';
  classId: string;
  className?: string;
  subjectId: string;
  subjectName?: string;
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  submissionCount: number;
  gradedCount: number;
  attachments: Attachment[];
  isDeadlinePassed?: boolean;
  timeRemaining?: string;
}

export interface CreateAssignmentDto {
  title: string;
  description?: string;
  deadline: string;
  maximumMarks: number;
  classId: string;
  subjectId: string;
  status: 'Draft' | 'Published';
}

export interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  deadline?: string;
  maximumMarks?: number;
  classId?: string;
  subjectId?: string;
  status?: 'Draft' | 'Published' | 'Closed';
}