// src\types\file.types.ts
export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface FileUploadResult {
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
}

export interface FileUploadProgress {
  progress: number;
  fileName: string;
}