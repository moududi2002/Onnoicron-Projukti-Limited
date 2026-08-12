import { PaginatedResponse, ApiResponse } from './common.types';

export type { PaginatedResponse, ApiResponse };

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface RequestParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  [key: string]: any;
}