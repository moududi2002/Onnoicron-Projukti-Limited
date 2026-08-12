// src/app/(dashboard)/admin/classes/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import Link from 'next/link';

const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  description: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
});

type CreateClassFormData = z.infer<typeof createClassSchema>;

export default function CreateClassPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),
  });

  const onSubmit = async (data: CreateClassFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/class', data);
      toast.success('Class created successfully');
      router.push('/admin/classes');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create class');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Class</h1>
        <p className="mt-1 text-sm text-gray-600">Add a new class</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Class Name</label>
          <input {...register('name')} type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., Class 10-A" />
          {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea {...register('description')} rows={3} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Academic Year</label>
          <input {...register('academicYear')} type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., 2024-2025" />
          {errors.academicYear && <p className="mt-1 text-sm text-danger-600">{errors.academicYear.message}</p>}
        </div>
        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <Link href="/admin/classes" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Class'}
          </button>
        </div>
      </form>
    </div>
  );
}