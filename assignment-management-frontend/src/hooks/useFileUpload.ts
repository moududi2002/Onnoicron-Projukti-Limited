'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/services/api-client';

interface UseFileUploadOptions {
  url: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useFileUpload({ url, onSuccess, onError }: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    setProgress(0);
    try {
      const result = await apiClient.uploadFile(url, file, setProgress);
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Upload failed';
      setError(msg);
      onError?.(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [url, onSuccess, onError]);

  return { upload, uploading, progress, error };
}