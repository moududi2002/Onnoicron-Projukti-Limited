// src/app/(dashboard)/teacher/assignments/[id]/submissions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { Submission, PaginatedResponse } from '@/types';
import { HiArrowLeft, HiCheck } from 'react-icons/hi';

export default function SubmissionsPage() {
  const params = useParams();
  const assignmentId = params.id as string;
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSubmissions();
  }, [page]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<PaginatedResponse<Submission>>(`/submission/assignment/${assignmentId}?page=${page}&limit=10`);
      setSubmissions(data.data);
      setTotalPages(data.totalPages);
    } catch {} finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Graded': return 'bg-success-100 text-success-800';
      case 'Submitted': return 'bg-primary-100 text-primary-800';
      case 'LateSubmitted': return 'bg-warning-100 text-warning-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Link href={`/teacher/assignments/${assignmentId}/view`} className="inline-flex items-center text-gray-600"><HiArrowLeft className="mr-2" />Back</Link>
      <h1 className="text-2xl font-bold">Submissions</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center">Loading...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center">No submissions</td></tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{s.studentName}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(s.status)}`}>{s.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.submittedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{s.marks !== undefined ? `${s.marks}/${s.maximumMarks}` : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/teacher/assignments/${assignmentId}/submissions/${s.id}`} className="text-primary-600"><HiCheck className="h-5 w-5" /></Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}