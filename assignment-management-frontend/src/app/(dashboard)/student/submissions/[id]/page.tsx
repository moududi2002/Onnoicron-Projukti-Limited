// src/app/(dashboard)/student/submissions/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { Submission } from '@/types';
import { HiArrowLeft } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function StudentViewSubmissionPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Submission>(`/submission/${submissionId}`)
      .then(setSubmission)
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!submission) {
    return <p className="text-center py-12 text-gray-500">Submission not found</p>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Graded': return 'bg-success-100 text-success-800';
      case 'Submitted': return 'bg-primary-100 text-primary-800';
      case 'LateSubmitted': return 'bg-warning-100 text-warning-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/student/submissions" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <HiArrowLeft className="mr-2 h-5 w-5" /> Back to Submissions
      </Link>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">{submission.assignmentTitle || 'Submission'}</h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(submission.status)}`}>
            {submission.status}
          </span>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Your Answer:</h3>
          <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
            {submission.content}
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          Submitted on: {new Date(submission.submittedAt).toLocaleString()}
          {submission.isLate && <span className="text-warning-600 ml-2">(Late Submission)</span>}
        </div>

        {submission.isGraded && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade & Feedback</h2>
            
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Marks Obtained:</span>
                <span className="text-2xl font-bold text-success-700">
                  {submission.marks}/{submission.maximumMarks}
                </span>
              </div>
              {submission.gradePercentage && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-success-600 h-2.5 rounded-full" 
                    style={{ width: submission.gradePercentage }}
                  ></div>
                </div>
              )}
            </div>

            {submission.feedback && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Teacher Feedback:</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{submission.feedback}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}