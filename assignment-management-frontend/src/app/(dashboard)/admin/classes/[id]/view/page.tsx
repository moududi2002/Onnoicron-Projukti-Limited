'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { HiPencil, HiArrowLeft, HiUsers, HiBookOpen } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

interface ClassDetail {
  id: string;
  name: string;
  description?: string;
  academicYear: string;
  isActive: boolean;
  studentCount: number;
  subjectCount: number;
  createdAt: string;
}

export default function ViewClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClass();
  }, [classId]);

  const fetchClass = async () => {
    try {
      const data = await apiClient.get<ClassDetail>(`/class/${classId}`);
      setClassData(data);
    } catch {
      toast.error('Failed to load class');
      router.push('/admin/classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!classData) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/classes" className="text-gray-600 hover:text-gray-900"><HiArrowLeft className="h-6 w-6" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">Class Details</h1>
        </div>
        <Link href={`/admin/classes/${classId}`} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <HiPencil className="mr-2 h-5 w-5" />Edit
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{classData.name}</h2>
        {classData.description && <p className="text-gray-600 mb-4">{classData.description}</p>}
        
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <HiUsers className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-2xl font-bold">{classData.studentCount}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <HiBookOpen className="h-8 w-8 text-success-600" />
            <div>
              <p className="text-sm text-gray-500">Subjects</p>
              <p className="text-2xl font-bold">{classData.subjectCount}</p>
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4">
          <div><dt className="text-sm text-gray-500">Academic Year</dt><dd className="text-sm font-medium">{classData.academicYear}</dd></div>
          <div><dt className="text-sm text-gray-500">Status</dt><dd><span className={`px-2 py-1 text-xs rounded-full ${classData.isActive ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'}`}>{classData.isActive ? 'Active' : 'Inactive'}</span></dd></div>
          <div><dt className="text-sm text-gray-500">Created</dt><dd className="text-sm">{new Date(classData.createdAt).toLocaleDateString()}</dd></div>
        </dl>
      </div>
    </div>
  );
}