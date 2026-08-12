// src/app/(dashboard)/teacher/assignments/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import Link from 'next/link';

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  maximumMarks: z.number().min(1).max(1000),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  status: z.enum(['Draft', 'Published']),
});

type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;

interface ClassOption { id: string; name: string; }
interface SubjectOption { id: string; name: string; }

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: { status: 'Draft', maximumMarks: 100 },
  });

  const selectedClassId = watch('classId');

  useEffect(() => {
    apiClient.get<ClassOption[]>('/teacher/classes').then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      apiClient.get<SubjectOption[]>(`/teacher/classes/${selectedClassId}/subjects`).then(setSubjects).catch(() => {});
    } else {
      setSubjects([]);
    }
  }, [selectedClassId]);

  const onSubmit = async (data: CreateAssignmentFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/assignment', data);
      toast.success('Assignment created');
      router.push('/teacher/assignments');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Assignment</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input {...register('title')} className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
          {errors.title && <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea {...register('description')} rows={4} className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">Class</label>
            <select {...register('classId')} className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500">
              <option value="">Select Class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.classId && <p className="mt-1 text-sm text-danger-600">{errors.classId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Subject</label>
            <select {...register('subjectId')} className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" disabled={!selectedClassId}>
              <option value="">Select Subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.subjectId && <p className="mt-1 text-sm text-danger-600">{errors.subjectId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Deadline</label>
            <input {...register('deadline')} type="datetime-local" className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
            {errors.deadline && <p className="mt-1 text-sm text-danger-600">{errors.deadline.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Maximum Marks</label>
            <input {...register('maximumMarks', { valueAsNumber: true })} type="number" className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
            {errors.maximumMarks && <p className="mt-1 text-sm text-danger-600">{errors.maximumMarks.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select {...register('status')} className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500">
            <option value="Draft">Draft</option>
            <option value="Published">Publish Now</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Link href="/teacher/assignments" className="px-4 py-2 border rounded-lg text-sm">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}