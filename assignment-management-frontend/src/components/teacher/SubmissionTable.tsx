'use client';

import Link from 'next/link';
import { HiCheck } from 'react-icons/hi';
import StatusBadge from '@/components/shared/StatusBadge';
import { Submission } from '@/types';

interface SubmissionTableProps {
  submissions: Submission[];
  assignmentId: string;
  loading?: boolean;
}

export default function SubmissionTable({ submissions, assignmentId, loading }: SubmissionTableProps) {
  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!submissions.length) return <div className="text-center py-8 text-gray-500">No submissions</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {submissions.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium">{s.studentName}</td>
              <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
              <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.submittedAt).toLocaleString()}</td>
              <td className="px-6 py-4 text-sm">{s.marks !== undefined ? `${s.marks}/${s.maximumMarks}` : '-'}</td>
              <td className="px-6 py-4 text-right">
                <Link href={`/teacher/assignments/${assignmentId}/submissions/${s.id}`} className="text-primary-600"><HiCheck className="h-5 w-5" /></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}