import { apiClient } from './api-client';

export const fileService = {
  uploadAssignmentFile: (assignmentId: string, file: File, onProgress?: (p: number) => void) =>
    apiClient.uploadFile(`/fileupload/assignment/${assignmentId}`, file, onProgress),
  uploadSubmissionFile: (submissionId: string, file: File, onProgress?: (p: number) => void) =>
    apiClient.uploadFile(`/fileupload/submission/${submissionId}`, file, onProgress),
  deleteAssignmentFile: (attachmentId: string) => apiClient.delete(`/fileupload/assignment/${attachmentId}`),
  deleteSubmissionFile: (attachmentId: string) => apiClient.delete(`/fileupload/submission/${attachmentId}`),
  getDownloadUrl: (fileUrl: string) => `${process.env.NEXT_PUBLIC_API_URL}/fileupload/download?fileUrl=${encodeURIComponent(fileUrl)}`,
};