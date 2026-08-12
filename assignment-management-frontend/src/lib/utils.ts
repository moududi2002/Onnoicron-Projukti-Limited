import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Active: 'bg-success-100 text-success-800',
    Inactive: 'bg-danger-100 text-danger-800',
    Draft: 'bg-warning-100 text-warning-800',
    Published: 'bg-success-100 text-success-800',
    Closed: 'bg-gray-100 text-gray-800',
    Submitted: 'bg-primary-100 text-primary-800',
    LateSubmitted: 'bg-warning-100 text-warning-800',
    Graded: 'bg-success-100 text-success-800',
    Rejected: 'bg-danger-100 text-danger-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}