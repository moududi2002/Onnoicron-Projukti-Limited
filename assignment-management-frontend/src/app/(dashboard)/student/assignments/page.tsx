'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { Assignment } from '@/types';
import { HiEye } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Assignment[]>('/assignment/student')
      .then(setAssignments)
      .catch(() => toast.error('Failed to load assignments'))
      .finally(() => setLoading(false));
  }, []);

  const isDeadlinePassed = (deadline: string) => new Date(deadline) < new Date();
  const getTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return 'Deadline passed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No assignments available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((a) => (
            <div key={a.id} className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${isDeadlinePassed(a.deadline) ? 'border-l-4 border-danger-500' : 'border-l-4 border-success-500'}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{a.title}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Subject:</span> {a.subjectName}</p>
                <p><span className="font-medium">Marks:</span> {a.maximumMarks}</p>
                <p className={isDeadlinePassed(a.deadline) ? 'text-danger-600 font-medium' : 'text-success-600 font-medium'}>
                  {getTimeRemaining(a.deadline)}
                </p>
              </div>
              <Link
                href={`/student/assignments/${a.id}`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm w-full justify-center"
              >
                <HiEye className="mr-2 h-4 w-4" /> View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}