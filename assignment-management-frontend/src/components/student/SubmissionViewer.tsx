import { Submission } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';

interface SubmissionViewerProps {
  submission: Submission;
}

export default function SubmissionViewer({ submission }: SubmissionViewerProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{submission.assignmentTitle || 'Submission'}</h2>
        <StatusBadge status={submission.status} />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Your Answer:</h3>
        <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm">
          {submission.content}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Submitted: {new Date(submission.submittedAt).toLocaleString()}
        {submission.isLate && <span className="text-warning-600 ml-2">(Late)</span>}
      </div>

      {submission.attachments && submission.attachments.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Attachments:</h3>
          <div className="space-y-1">
            {submission.attachments.map((file) => (
              <a key={file.id} href={file.fileUrl} className="text-primary-600 text-sm block hover:underline">
                {file.fileName}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}