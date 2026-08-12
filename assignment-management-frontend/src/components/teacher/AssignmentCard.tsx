import Link from 'next/link';
import StatusBadge from '@/components/shared/StatusBadge';

interface AssignmentCardProps {
  id: string;
  title: string;
  subjectName?: string;
  className?: string;
  maximumMarks: number;
  status: string;
  deadline: string;
  submissionCount: number;
  gradedCount: number;
}

export default function AssignmentCard({
  id, title, subjectName, className, maximumMarks, status, deadline, submissionCount, gradedCount,
}: AssignmentCardProps) {
  const isDeadlinePassed = new Date(deadline) < new Date();

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${isDeadlinePassed ? 'border-danger-500' : 'border-success-500'}`}>
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
      <div className="space-y-1 text-sm text-gray-600 mb-4">
        {subjectName && <p><span className="font-medium">Subject:</span> {subjectName}</p>}
        {className && <p><span className="font-medium">Class:</span> {className}</p>}
        <p><span className="font-medium">Marks:</span> {maximumMarks}</p>
        <p><span className="font-medium">Submissions:</span> {submissionCount} ({gradedCount} graded)</p>
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={status} />
        <Link href={`/teacher/assignments/${id}/view`} className="text-primary-600 text-sm hover:underline">View</Link>
      </div>
    </div>
  );
}