'use client';

import { useState, useRef } from 'react';
import { HiUpload, HiX, HiDocument } from 'react-icons/hi';
import { apiClient } from '@/services/api-client';

interface FileUploadProps {
  uploadUrl: string;
  onUploadComplete: (file: any) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
}

export default function FileUpload({
  uploadUrl,
  onUploadComplete,
  accept = '.pdf,.doc,.docx,.txt,.jpg,.png,.zip',
  maxSize = 10,
  multiple = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length) return;

    const file = selectedFiles[0];
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await apiClient.uploadFile(uploadUrl, file, setProgress);
      setFiles([...files, result]);
      onUploadComplete(result);
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <input ref={inputRef} type="file" onChange={handleUpload} accept={accept} multiple={multiple} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
          <HiUpload className="mr-2 h-4 w-4" /> Choose File
        </label>
        <span className="text-sm text-gray-500">Max {maxSize}MB</span>
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="text-sm text-danger-600">{error}</p>}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center space-x-2 bg-gray-50 p-2 rounded text-sm">
              <HiDocument className="h-4 w-4 text-gray-500" />
              <span className="flex-1 truncate">{f.fileName}</span>
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-danger-500"><HiX className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}