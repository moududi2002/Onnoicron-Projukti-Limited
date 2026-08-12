import { HiDocument, HiPhotograph, HiX } from 'react-icons/hi';

interface FilePreviewProps {
  file: { fileName: string; fileUrl: string; contentType: string; fileSize: number };
  onRemove?: () => void;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.contentType?.startsWith('image/');

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3 min-w-0">
        {isImage ? (
          <img src={file.fileUrl} alt={file.fileName} className="h-10 w-10 object-cover rounded" />
        ) : (
          <HiDocument className="h-10 w-10 text-gray-400" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
          <p className="text-xs text-gray-500">{(file.fileSize / 1024).toFixed(1)} KB</p>
        </div>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="ml-3 text-danger-500 hover:text-danger-700">
          <HiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}