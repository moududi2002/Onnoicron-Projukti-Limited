export interface Class {
  id: string;
  name: string;
  description?: string;
  academicYear: string;
  isActive: boolean;
  studentCount: number;
  subjectCount: number;
  createdAt: string;
}

export interface CreateClassDto {
  name: string;
  description?: string;
  academicYear: string;
}

export interface UpdateClassDto {
  name?: string;
  description?: string;
  academicYear?: string;
  isActive?: boolean;
}