import { Assignment } from '@/types';
import DeadlineCountdown from './DeadlineCountdown';
import { HiDocument, HiDownload } from 'react-icons/hi';

interface AssignmentDetailsProps {
  assignment: Assignment;
  hasSubmitted: boolean;
}

export default function AssignmentDetails({ assignment, hasSubmitted }: AssignmentDetailsProps) {
  const isDeadlinePassed = new Date(assignment.deadline) < new Date();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{assignment.title}</h1>
        
        {assignment.description && (
          <div className="prose max-w-none mb-6 text-gray-600 whitespace-pre-wrap">
            {assignment.description}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
          <div>
            <span className="text-xs text-gray-500">Subject</span>
            <p className="font-medium text-sm">{assignment.subjectName || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Maximum Marks</span>
            <p className="font-medium text-sm">{assignment.maximumMarks}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Deadline</span>
            <DeadlineCountdown deadline={assignment.deadline} showDate />
          </div>
          <div>
            <span className="text-xs text-gray-500">Status</span>
            <p className={`font-medium text-sm ${hasSubmitted ? 'text-success-600' : 'text-warning-600'}`}>
              {hasSubmitted ? 'Submitted' : 'Pending'}
            </p>
          </div>
        </div>

        {/* Attachments */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Attachments</h3>
            <div className="space-y-2">
              {assignment.attachments.map((file) => (
                <a
                  key={file.id}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <HiDocument className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{file.fileName}</span>
                    <span className="text-xs text-gray-400">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                  </div>
                  <HiDownload className="h-5 w-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Submission Status */}
        {hasSubmitted ? (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <p className="text-success-700 font-medium text-sm">You have submitted this assignment.</p>
          </div>
        ) : isDeadlinePassed ? (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <p className="text-danger-700 font-medium text-sm">The deadline has passed.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}