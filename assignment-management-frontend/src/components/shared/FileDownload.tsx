import { HiDownload } from 'react-icons/hi';

interface FileDownloadProps {
  fileUrl: string;
  fileName: string;
}

export default function FileDownload({ fileUrl, fileName }: FileDownloadProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center px-3 py-1.5 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
    >
      <HiDownload className="mr-1.5 h-4 w-4" />
      {fileName}
    </button>
  );
}