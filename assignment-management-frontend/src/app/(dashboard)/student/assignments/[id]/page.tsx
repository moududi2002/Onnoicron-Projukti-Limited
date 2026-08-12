// src/app/(dashboard)/student/assignments/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { Assignment } from '@/types';
import { HiArrowLeft, HiUpload } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function StudentViewAssignmentPage() {
  const params = useParams();
  const assignmentId = params.id as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    fetchAssignment();
    checkSubmission();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const data = await apiClient.get<Assignment>(`/assignment/${assignmentId}`);
      setAssignment(data);
    } catch {
      toast.error('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const checkSubmission = async () => {
    try {
      const result = await apiClient.get<any>(`/submission/check/${assignmentId}`);
      setHasSubmitted(result.hasSubmitted);
    } catch {}
  };

  const isDeadlinePassed = assignment ? new Date(assignment.deadline) < new Date() : false;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return <p className="text-center py-12 text-gray-500">Assignment not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/student/assignments" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <HiArrowLeft className="mr-2 h-5 w-5" /> Back to Assignments
      </Link>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{assignment.title}</h1>
        <p className="text-gray-600 mb-6 whitespace-pre-wrap">{assignment.description || 'No description provided.'}</p>

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="text-sm text-gray-500">Subject</span>
            <p className="font-medium">{assignment.subjectName}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Maximum Marks</span>
            <p className="font-medium">{assignment.maximumMarks}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Deadline</span>
            <p className={`font-medium ${isDeadlinePassed ? 'text-danger-600' : 'text-success-600'}`}>
              {new Date(assignment.deadline).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Status</span>
            <p className="font-medium">{hasSubmitted ? 'Submitted' : 'Pending'}</p>
          </div>
        </div>

        {assignment.attachments && assignment.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Attachments</h3>
            <div className="space-y-2">
              {assignment.attachments.map((file) => (
                <a key={file.id} href={file.fileUrl} target="_blank" className="flex items-center text-primary-600 hover:text-primary-800">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {file.fileName}
                </a>
              ))}
            </div>
          </div>
        )}

        {hasSubmitted ? (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <p className="text-success-700 font-medium">You have already submitted this assignment.</p>
            <Link href="/student/submissions" className="text-success-600 underline mt-1 inline-block">View your submission</Link>
          </div>
        ) : isDeadlinePassed ? (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <p className="text-danger-700 font-medium">The deadline has passed.</p>
          </div>
        ) : (
          <Link
            href={`/student/assignments/${assignmentId}/submit`}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <HiUpload className="mr-2 h-5 w-5" /> Submit Assignment
          </Link>
        )}
      </div>
    </div>
  );
}