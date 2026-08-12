'use client';

import Link from 'next/link';
import { HiPencil, HiTrash, HiEye, HiUsers } from 'react-icons/hi';
import Badge from '@/components/ui/Badge';

interface ClassItem {
  id: string;
  name: string;
  academicYear: string;
  studentCount: number;
  subjectCount: number;
  isActive: boolean;
}

interface ClassTableProps {
  classes: ClassItem[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function ClassTable({ classes, onDelete, loading }: ClassTableProps) {
  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (!classes.length) return <div className="text-center py-8 text-gray-500">No classes found</div>;

  return (
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
          {classes.map((cls) => (
            <tr key={cls.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{cls.academicYear}</td>
              <td className="px-6 py-4 text-sm text-gray-500"><HiUsers className="inline mr-1 h-4 w-4" />{cls.studentCount}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{cls.subjectCount}</td>
              <td className="px-6 py-4"><Badge variant={cls.isActive ? 'success' : 'danger'}>{cls.isActive ? 'Active' : 'Inactive'}</Badge></td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">
                  <Link href={`/admin/classes/${cls.id}/view`} className="text-gray-600"><HiEye className="h-5 w-5" /></Link>
                  <Link href={`/admin/classes/${cls.id}`} className="text-primary-600"><HiPencil className="h-5 w-5" /></Link>
                  <button onClick={() => onDelete(cls.id)} className="text-danger-600"><HiTrash className="h-5 w-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}