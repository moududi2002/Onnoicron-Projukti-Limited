// src/app/(dashboard)/admin/classes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import Link from 'next/link';

const updateClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  description: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
  isActive: z.boolean(),
});

type UpdateClassFormData = z.infer<typeof updateClassSchema>;

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateClassFormData>({
    resolver: zodResolver(updateClassSchema),
  });

  useEffect(() => {
    fetchClass();
  }, [classId]);

  const fetchClass = async () => {
    try {
      const data = await apiClient.get<any>(`/class/${classId}`);
      reset({
        name: data.name,
        description: data.description || '',
        academicYear: data.academicYear,
        isActive: data.isActive,
      });
    } catch {
      toast.error('Failed to load class');
      router.push('/admin/classes');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateClassFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/class/${classId}`, data);
      toast.success('Class updated');
      router.push('/admin/classes');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update class');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Class Name</label>
          <input {...register('name')} type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" />
          {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea {...register('description')} rows={3} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Academic Year</label>
          <input {...register('academicYear')} type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" />
          {errors.academicYear && <p className="mt-1 text-sm text-danger-600">{errors.academicYear.message}</p>}
        </div>
        <div>
          <label className="flex items-center">
            <input {...register('isActive')} type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Link href="/admin/classes" className="px-4 py-2 border rounded-lg text-sm">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Update Class'}
          </button>
        </div>
      </form>
    </div>
  );
}