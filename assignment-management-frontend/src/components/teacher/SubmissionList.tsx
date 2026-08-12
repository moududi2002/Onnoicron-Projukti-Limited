import Link from 'next/link';
import { HiCheck } from 'react-icons/hi';
import StatusBadge from '@/components/shared/StatusBadge';
import { Submission } from '@/types';

interface SubmissionListProps {
  submissions: Submission[];
  assignmentId: string;
}

export default function SubmissionList({ submissions, assignmentId }: SubmissionListProps) {
  if (!submissions.length) {
    return <p className="text-center py-8 text-gray-500">No submissions yet</p>;
  }

  return (
    <div className="space-y-3">
      {submissions.map((s) => (
        <div key={s.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{s.studentName || s.studentId}</p>
            <div className="flex items-center space-x-3 mt-1">
              <StatusBadge status={s.status} />
              <span className="text-sm text-gray-500">{new Date(s.submittedAt).toLocaleString()}</span>
              {s.marks !== undefined && <span className="text-sm font-medium">{s.marks}/{s.maximumMarks}</span>}
            </div>
          </div>
          <Link href={`/teacher/assignments/${assignmentId}/submissions/${s.id}`} className="text-primary-600">
            <HiCheck className="h-6 w-6" />
          </Link>
        </div>
      ))}
    </div>
  );
}