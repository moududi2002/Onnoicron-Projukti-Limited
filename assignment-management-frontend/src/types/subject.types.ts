export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  className?: string;
  isActive: boolean;
  teacherCount: number;
}

export interface CreateSubjectDto {
  name: string;
  code: string;
  classId: string;
}

export interface UpdateSubjectDto {
  name?: string;
  code?: string;
  classId?: string;
  isActive?: boolean;
}