// src/app/(dashboard)/student/submissions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { Submission } from '@/types';
import { HiEye } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Submission[]>('/submission/student')
      .then(setSubmissions)
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Graded': return 'bg-success-100 text-success-800';
      case 'Submitted': return 'bg-primary-100 text-primary-800';
      case 'LateSubmitted': return 'bg-warning-100 text-warning-800';
      case 'Rejected': return 'bg-danger-100 text-danger-800';
      case 'Resubmitted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No submissions yet</p>
          <Link href="/student/assignments" className="text-primary-600 hover:underline mt-2 inline-block">
            View available assignments
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{s.assignmentTitle || 'Assignment'}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                    {s.marks !== undefined && s.marks !== null && (
                      <span className="text-sm font-medium text-success-600">
                        {s.marks}/{s.maximumMarks} marks
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Submitted: {new Date(s.submittedAt).toLocaleString()}
                  </p>
                  {s.gradedAt && (
                    <p className="text-sm text-gray-500">
                      Graded: {new Date(s.gradedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <Link
                  href={`/student/submissions/${s.id}`}
                  className="ml-4 text-primary-600 hover:text-primary-900"
                >
                  <HiEye className="h-6 w-6" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}