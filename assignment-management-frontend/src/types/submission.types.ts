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
  strengths?: string;         // New
  areasForImprovement?: string; // New
  grade?: string;             // New (A+, A, B, C, D, F)
  submittedAt: string;
  updatedAt?: string;
  gradedAt?: string;
  attachments: Attachment[];
  isLate?: boolean;
  isGraded?: boolean;
  gradePercentage?: string;
}

export interface GradeSubmissionDto {
  marks: number;
  feedback?: string;
  strengths?: string;
  areasForImprovement?: string;
  grade?: string;
  status: 'Graded' | 'Rejected' | 'Resubmitted';
}