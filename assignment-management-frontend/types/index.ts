// types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student';
  firstName: string;
  lastName: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  maximumMarks: number;
  status: 'Draft' | 'Published' | 'Closed';
  classId: string;
  subjectId: string;
  subjectName: string;
  createdByName: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  content: string;
  status: 'Submitted' | 'LateSubmitted' | 'Graded' | 'Rejected' | 'Resubmitted';
  marks?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}