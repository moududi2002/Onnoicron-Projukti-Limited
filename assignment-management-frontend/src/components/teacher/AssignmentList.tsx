'use client';

import Link from 'next/link';
import { HiPencil, HiEye, HiTrash } from 'react-icons/hi';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/shared/StatusBadge';
import { Assignment } from '@/types';

interface AssignmentListProps {
  assignments: Assignment[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function AssignmentList({ assignments, onDelete, loading }: AssignmentListProps) {
  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!assignments.length) return <div className="text-center py-8 text-gray-500">No assignments yet</div>;

  return (
    <div className="space-y-4">
      {assignments.map((a) => (
        <div key={a.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{a.subjectName}</span>
                <span>•</span>
                <span>{a.className}</span>
                <span>•</span>
                <span>Max: {a.maximumMarks}</span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <StatusBadge status={a.status} />
                <span className="text-sm text-gray-500">
                  Deadline: {new Date(a.deadline).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-500">
                  {a.submissionCount} submissions ({a.gradedCount} graded)
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Link href={`/teacher/assignments/${a.id}/view`} className="text-gray-600 hover:text-gray-900"><HiEye className="h-5 w-5" /></Link>
              <Link href={`/teacher/assignments/${a.id}`} className="text-primary-600 hover:text-primary-900"><HiPencil className="h-5 w-5" /></Link>
              <Link href={`/teacher/assignments/${a.id}/submissions`} className="text-success-600 hover:text-success-900"><HiEye className="h-5 w-5" /></Link>
              <button onClick={() => onDelete(a.id)} className="text-danger-600 hover:text-danger-900"><HiTrash className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}