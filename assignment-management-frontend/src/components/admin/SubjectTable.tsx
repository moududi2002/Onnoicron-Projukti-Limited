'use client';

import Link from 'next/link';
import { HiPencil, HiTrash } from 'react-icons/hi';
import Badge from '@/components/ui/Badge';

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  className?: string;
  teacherCount: number;
  isActive: boolean;
}

interface SubjectTableProps {
  subjects: SubjectItem[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function SubjectTable({ subjects, onDelete, loading }: SubjectTableProps) {
  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (!subjects.length) return <div className="text-center py-8 text-gray-500">No subjects found</div>;

  return (
    <div className="overflow-x-auto">
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
          {subjects.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium">{s.name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{s.code}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{s.className || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{s.teacherCount}</td>
              <td className="px-6 py-4"><Badge variant={s.isActive ? 'success' : 'danger'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">
                  <Link href={`/admin/subjects/${s.id}`} className="text-primary-600"><HiPencil className="h-5 w-5" /></Link>
                  <button onClick={() => onDelete(s.id)} className="text-danger-600"><HiTrash className="h-5 w-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}