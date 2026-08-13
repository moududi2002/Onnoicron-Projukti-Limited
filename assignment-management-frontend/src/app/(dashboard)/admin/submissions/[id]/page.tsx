'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { Submission } from '@/types';
import { HiArrowLeft } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function AdminViewSubmissionPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const data = await apiClient.get<Submission>(`/submission/${submissionId}`);
      setSubmission(data);
    } catch {
      toast.error('Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!submission) return <p className="text-center py-12">Submission not found</p>;

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
      <Link href="/admin/submissions" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <HiArrowLeft className="mr-2" /> Back to Submissions
      </Link>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold">{submission.assignmentTitle}</h1>
            <p className="text-gray-600">Student: {submission.studentName}</p>
          </div>
          <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
            {submission.status}
          </span>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Content:</h3>
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{submission.content}</div>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          Submitted: {new Date(submission.submittedAt).toLocaleString()}
        </div>

        {submission.isGraded && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Grade & Feedback</h3>
            <p className="text-lg font-bold text-success-600">
              {submission.marks}/{submission.maximumMarks}
            </p>
            {submission.feedback && (
              <div className="mt-2 bg-blue-50 p-3 rounded-lg">
                <p className="text-sm">{submission.feedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}