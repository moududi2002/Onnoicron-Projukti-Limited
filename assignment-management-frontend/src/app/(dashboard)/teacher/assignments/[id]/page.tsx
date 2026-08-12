// src/app/(dashboard)/teacher/assignments/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import { Assignment } from '@/types';
import Link from 'next/link';

const updateAssignmentSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  deadline: z.string().min(1),
  maximumMarks: z.number().min(1).max(1000),
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  status: z.enum(['Draft', 'Published', 'Closed']),
});

type UpdateAssignmentFormData = z.infer<typeof updateAssignmentSchema>;

export default function EditAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateAssignmentFormData>({
    resolver: zodResolver(updateAssignmentSchema),
  });

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const data = await apiClient.get<Assignment>(`/assignment/${assignmentId}`);
      reset({
        title: data.title,
        description: data.description || '',
        deadline: new Date(data.deadline).toISOString().slice(0, 16),
        maximumMarks: data.maximumMarks,
        classId: data.classId,
        subjectId: data.subjectId,
        status: data.status as any,
      });
    } catch {
      toast.error('Failed to load assignment');
      router.push('/teacher/assignments');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateAssignmentFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/assignment/${assignmentId}`, data);
      toast.success('Assignment updated');
      router.push('/teacher/assignments');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Assignment</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input {...register('title')} className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea {...register('description')} rows={4} className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">Deadline</label>
            <input {...register('deadline')} type="datetime-local" className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium">Maximum Marks</label>
            <input {...register('maximumMarks', { valueAsNumber: true })} type="number" className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select {...register('status')} className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500">
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Link href="/teacher/assignments" className="px-4 py-2 border rounded-lg text-sm">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}