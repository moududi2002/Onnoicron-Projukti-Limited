'use client';

import Link from 'next/link';
import { HiPencil, HiTrash, HiEye } from 'react-icons/hi';
import Badge from '@/components/ui/Badge';
import { User } from '@/types';

interface UserTableProps {
  users: User[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function UserTable({ users, onDelete, loading }: UserTableProps) {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!users.length) {
    return <div className="text-center py-8 text-gray-500">No users found</div>;
  }

  const roleVariant = (role: string) => {
    switch (role) {
      case 'Admin': return 'purple';
      case 'Teacher': return 'primary';
      case 'Student': return 'success';
      default: return 'gray';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={roleVariant(user.role) as any}>{user.role}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link href={`/admin/users/${user.id}/view`} className="text-gray-600 hover:text-gray-900"><HiEye className="h-5 w-5" /></Link>
                  <Link href={`/admin/users/${user.id}`} className="text-primary-600 hover:text-primary-900"><HiPencil className="h-5 w-5" /></Link>
                  <button onClick={() => onDelete(user.id)} className="text-danger-600 hover:text-danger-900"><HiTrash className="h-5 w-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}