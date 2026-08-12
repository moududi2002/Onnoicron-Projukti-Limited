// src/app/(dashboard)/teacher/assignments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { Assignment } from '@/types';
import { HiPlus, HiPencil, HiEye, HiTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await apiClient.get<Assignment[]>('/assignment/teacher');
      setAssignments(data);
    } catch {
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await apiClient.delete(`/assignment/${id}`);
      toast.success('Assignment deleted');
      fetchAssignments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-success-100 text-success-800';
      case 'Draft': return 'bg-warning-100 text-warning-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <Link href="/teacher/assignments/create" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><HiPlus className="mr-2 h-5 w-5" />Create</Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submissions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center">Loading...</td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No assignments yet</td></tr>
            ) : (
              assignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{a.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.subjectName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(a.deadline).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.maximumMarks}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(a.status)}`}>{a.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.submissionCount} / {a.gradedCount} graded</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/teacher/assignments/${a.id}/view`} className="text-gray-600 hover:text-gray-900"><HiEye className="h-5 w-5" /></Link>
                      <Link href={`/teacher/assignments/${a.id}`} className="text-primary-600"><HiPencil className="h-5 w-5" /></Link>
                      <Link href={`/teacher/assignments/${a.id}/submissions`} className="text-success-600"><HiEye className="h-5 w-5" /></Link>
                      <button onClick={() => handleDelete(a.id)} className="text-danger-600"><HiTrash className="h-5 w-5" /></button>
                    </div>
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