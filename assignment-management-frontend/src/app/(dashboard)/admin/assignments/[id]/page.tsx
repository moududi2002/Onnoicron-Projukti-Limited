// src/app/(dashboard)/admin/assignments/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { Assignment } from '@/types';
import { HiArrowLeft, HiDocumentText, HiUsers } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function AdminViewAssignmentPage() {
  const params = useParams();
  const assignmentId = params.id as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!assignment) return <p className="text-center py-12 text-gray-500">Assignment not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/assignments" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <HiArrowLeft className="mr-2 h-5 w-5" /> Back to Assignments
      </Link>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
        <p className="text-gray-600 mb-6 whitespace-pre-wrap">{assignment.description || 'No description'}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-xs text-gray-500">Subject</span>
            <p className="font-medium">{assignment.subjectName}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-xs text-gray-500">Class</span>
            <p className="font-medium">{assignment.className}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-xs text-gray-500">Teacher</span>
            <p className="font-medium">{assignment.createdByName}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-xs text-gray-500">Maximum Marks</span>
            <p className="font-medium">{assignment.maximumMarks}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-xs text-gray-500">Status</span>
            <p className="font-medium">{assignment.status}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-xs text-gray-500">Deadline</span>
            <p className="font-medium">{new Date(assignment.deadline).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 border-t pt-4">
          <div className="flex items-center">
            <HiDocumentText className="h-5 w-5 text-primary-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Submissions</p>
              <p className="font-medium">{assignment.submissionCount}</p>
            </div>
          </div>
          <div className="flex items-center">
            <HiUsers className="h-5 w-5 text-success-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Graded</p>
              <p className="font-medium">{assignment.gradedCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}