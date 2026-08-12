// src/app/(dashboard)/admin/assignments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { Assignment, PaginatedResponse } from '@/types';
import { HiEye } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAssignments();
  }, [page]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<PaginatedResponse<Assignment>>(`/assignment?page=${page}&limit=10`);
      setAssignments(data.data);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-success-100 text-success-800';
      case 'Draft': return 'bg-warning-100 text-warning-800';
      case 'Closed': return 'bg-danger-100 text-danger-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Assignments</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submissions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center">Loading...</td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No assignments</td></tr>
            ) : (
              assignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.subjectName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.className}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(a.deadline).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(a.status)}`}>{a.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.submissionCount}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/assignments/${a.id}`} className="text-primary-600 hover:text-primary-900"><HiEye className="h-5 w-5" /></Link>
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