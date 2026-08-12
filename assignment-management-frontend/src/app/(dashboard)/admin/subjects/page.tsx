// src/app/(dashboard)/admin/subjects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { PaginatedResponse } from '@/types';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

interface Subject {
  id: string;
  name: string;
  code: string;
  className?: string;
  classId: string;
  isActive: boolean;
  teacherCount: number;
}

export default function SubjectManagementPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSubjects();
  }, [page]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<PaginatedResponse<Subject>>(`/subject?page=${page}&limit=10`);
      setSubjects(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await apiClient.delete(`/subject/${id}`);
      toast.success('Subject deleted');
      fetchSubjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subject');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage all subjects</p>
        </div>
        <Link href="/admin/subjects/create" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <HiPlus className="mr-2 h-5 w-5" />Add Subject
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teachers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center">Loading...</td></tr>
            ) : subjects.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No subjects found</td></tr>
            ) : (
              subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{subject.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{subject.className || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{subject.teacherCount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${subject.isActive ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'}`}>
                      {subject.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/admin/subjects/${subject.id}`} className="text-primary-600 hover:text-primary-900"><HiPencil className="h-5 w-5" /></Link>
                      <button onClick={() => handleDelete(subject.id)} className="text-danger-600 hover:text-danger-900"><HiTrash className="h-5 w-5" /></button>
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