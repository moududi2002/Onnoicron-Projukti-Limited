export interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student';
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  fullName?: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: 'Admin' | 'Teacher' | 'Student';
  firstName: string;
  lastName: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
}