export const APP_NAME = 'Assignment Management System';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = '.pdf,.doc,.docx,.txt,.jpg,.png,.zip';
export const SESSION_TIMEOUT = 480; // minutes
export const ROLES = ['Admin', 'Teacher', 'Student'] as const;
export const ASSIGNMENT_STATUS = ['Draft', 'Published', 'Closed'] as const;
export const SUBMISSION_STATUS = ['Submitted', 'LateSubmitted', 'Graded', 'Rejected', 'Resubmitted'] as const;