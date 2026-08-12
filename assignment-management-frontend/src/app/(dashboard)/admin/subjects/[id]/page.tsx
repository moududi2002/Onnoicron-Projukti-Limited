// src/app/(dashboard)/admin/subjects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import Link from 'next/link';

const updateSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  classId: z.string().min(1, 'Class is required'),
  isActive: z.boolean(),
});

type UpdateSubjectFormData = z.infer<typeof updateSubjectSchema>;

interface ClassOption {
  id: string;
  name: string;
}

export default function EditSubjectPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateSubjectFormData>({
    resolver: zodResolver(updateSubjectSchema),
  });

  useEffect(() => {
    fetchClasses();
    fetchSubject();
  }, [subjectId]);

  const fetchClasses = async () => {
    try {
      const data = await apiClient.get<ClassOption[]>('/class/active');
      setClasses(data);
    } catch {}
  };

  const fetchSubject = async () => {
    try {
      const data = await apiClient.get<any>(`/subject/${subjectId}`);
      reset({
        name: data.name,
        code: data.code,
        classId: data.classId,
        isActive: data.isActive,
      });
    } catch {
      toast.error('Failed to load subject');
      router.push('/admin/subjects');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateSubjectFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/subject/${subjectId}`, data);
      toast.success('Subject updated');
      router.push('/admin/subjects');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Subject</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject Name</label>
          <input {...register('name')} type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" />
          {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject Code</label>
          <input {...register('code')} type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" />
          {errors.code && <p className="mt-1 text-sm text-danger-600">{errors.code.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Class</label>
          <select {...register('classId')} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500">
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.classId && <p className="mt-1 text-sm text-danger-600">{errors.classId.message}</p>}
        </div>
        <div>
          <label className="flex items-center">
            <input {...register('isActive')} type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Link href="/admin/subjects" className="px-4 py-2 border rounded-lg text-sm">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Update Subject'}
          </button>
        </div>
      </form>
    </div>
  );
}