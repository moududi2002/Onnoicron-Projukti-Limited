import type { Attachment } from './file.types';

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  content: string;
  status: 'Submitted' | 'LateSubmitted' | 'Graded' | 'Rejected' | 'Resubmitted';
  marks?: number;
  maximumMarks?: number;
  feedback?: string;
  strengths?: string;
  areasForImprovement?: string;
  grade?: string;
  submittedAt: string;
  updatedAt?: string;
  gradedAt?: string;
  attachments: Attachment[];
  isLate?: boolean;
  isGraded?: boolean;
  gradePercentage?: string;
}

export interface CreateSubmissionDto {
  assignmentId: string;
  content: string;
  attachmentIds?: string[];
}

export interface GradeSubmissionDto {
  marks: number;
  feedback?: string;
  strengths?: string;
  areasForImprovement?: string;
  grade?: string;
  status: 'Graded' | 'Rejected' | 'Resubmitted';
}