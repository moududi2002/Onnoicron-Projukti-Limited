import FileDownload from './FileDownload';
import FilePreview from './FilePreview';

interface FileItem {
  id: string;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
}

interface FileListProps {
  files: FileItem[];
  onRemove?: (id: string) => void;
}

export default function FileList({ files, onRemove }: FileListProps) {
  if (!files.length) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Attachments ({files.length})</h4>
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <FileDownload fileUrl={file.fileUrl} fileName={file.fileName} />
            {onRemove && (
              <button onClick={() => onRemove(file.id)} className="text-xs text-danger-500 hover:text-danger-700 ml-2">
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}