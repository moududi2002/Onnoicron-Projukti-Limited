import Link from 'next/link';
import { Assignment } from '@/types';
import DeadlineCountdown from './DeadlineCountdown';

interface AssignmentCardProps {
  assignment: Assignment;
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const isDeadlinePassed = new Date(assignment.deadline) < new Date();

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 ${
      isDeadlinePassed ? 'border-danger-500' : 'border-success-500'
    }`}>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{assignment.title}</h3>
        
        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
          {assignment.subjectName && (
            <p><span className="font-medium">Subject:</span> {assignment.subjectName}</p>
          )}
          <p><span className="font-medium">Marks:</span> {assignment.maximumMarks}</p>
          <DeadlineCountdown deadline={assignment.deadline} />
        </div>

        <Link
          href={`/student/assignments/${assignment.id}`}
          className="block w-full text-center px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}