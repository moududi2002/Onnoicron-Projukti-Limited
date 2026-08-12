// src/app/(dashboard)/admin/subjects/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import Link from 'next/link';

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  classId: z.string().min(1, 'Class is required'),
});

type CreateSubjectFormData = z.infer<typeof createSubjectSchema>;

interface ClassOption {
  id: string;
  name: string;
}

export default function CreateSubjectPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateSubjectFormData>({
    resolver: zodResolver(createSubjectSchema),
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await apiClient.get<ClassOption[]>('/class/active');
      setClasses(data);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const onSubmit = async (data: CreateSubjectFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/subject', data);
      toast.success('Subject created');
      router.push('/admin/subjects');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Subject</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject Name</label>
          <input {...register('name')} type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., Mathematics" />
          {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject Code</label>
          <input {...register('code')} type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., MATH101" />
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
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Link href="/admin/subjects" className="px-4 py-2 border rounded-lg text-sm">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Subject'}
          </button>
        </div>
      </form>
    </div>
  );
}