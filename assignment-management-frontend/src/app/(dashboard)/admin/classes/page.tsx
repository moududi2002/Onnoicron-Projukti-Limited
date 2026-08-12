// src/app/(dashboard)/admin/classes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { PaginatedResponse } from '@/types';
import { HiPlus, HiPencil, HiTrash, HiEye, HiUsers } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  description?: string;
  academicYear: string;
  isActive: boolean;
  studentCount: number;
  subjectCount: number;
  createdAt: string;
}

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchClasses();
  }, [page]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<PaginatedResponse<Class>>(`/class?page=${page}&limit=10`);
      setClasses(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      await apiClient.delete(`/class/${id}`);
      toast.success('Class deleted successfully');
      fetchClasses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete class');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage all classes</p>
        </div>
        <Link href="/admin/classes/create" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <HiPlus className="mr-2 h-5 w-5" />
          Add Class
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center">Loading...</td></tr>
              ) : classes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No classes found</td></tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                      {cls.description && <div className="text-sm text-gray-500">{cls.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cls.academicYear}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center">
                        <HiUsers className="mr-1 h-4 w-4" /> {cls.studentCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cls.subjectCount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cls.isActive ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                      }`}>
                        {cls.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/classes/${cls.id}/view`} className="text-gray-600 hover:text-gray-900"><HiEye className="h-5 w-5" /></Link>
                        <Link href={`/admin/classes/${cls.id}`} className="text-primary-600 hover:text-primary-900"><HiPencil className="h-5 w-5" /></Link>
                        <button onClick={() => handleDelete(cls.id)} className="text-danger-600 hover:text-danger-900"><HiTrash className="h-5 w-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}