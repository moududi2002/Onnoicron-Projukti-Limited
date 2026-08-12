'use client';

import Link from 'next/link';
import { Assignment } from '@/types';
import AssignmentCard from './AssignmentCard';

interface AvailableAssignmentsProps {
  assignments: Assignment[];
  loading?: boolean;
}

export default function AvailableAssignments({ assignments, loading }: AvailableAssignmentsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!assignments.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <HiClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No assignments available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
}

// Need to import
import { HiClipboardList } from 'react-icons/hi';