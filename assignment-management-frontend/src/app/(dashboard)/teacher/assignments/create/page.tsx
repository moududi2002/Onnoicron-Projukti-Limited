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
  maximumMarks: z.number().min(1, 'Maximum marks must be at least 1').max(1000),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  status: z.enum(['Draft', 'Published']),
});

type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;

interface TeacherClass {
  id: string;
  name: string;
  description?: string;
  academicYear: string;
  isActive: boolean;
  studentCount: number;
  subjectCount: number;
}

interface TeacherSubject {
  id: string;
  name: string;
  code: string;
  classId: string;
  className?: string;
  isActive: boolean;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      status: 'Draft',
      maximumMarks: 100,
    },
  });

  const selectedClassId = watch('classId');

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchTeacherSubjects(selectedClassId);
    } else {
      setSubjects([]);
    }
  }, [selectedClassId]);

  const fetchTeacherClasses = async () => {
    setLoadingClasses(true);
    try {
      const data = await apiClient.get<TeacherClass[]>('/assignment/teacher/classes');
      setClasses(data);
      if (data.length === 0) {
        toast.error('You are not assigned to any class. Please contact admin.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchTeacherSubjects = async (classId: string) => {
    setLoadingSubjects(true);
    try {
      const data = await apiClient.get<TeacherSubject[]>(`/assignment/teacher/classes/${classId}/subjects`);
      setSubjects(data);
      if (data.length === 0) {
        toast.error('No subjects found for this class. Please contact admin.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  {/*const onSubmit = async (data: CreateAssignmentFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/assignment', data);
      toast.success('Assignment created successfully!');
      router.push('/teacher/assignments');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };
  */}

    const onSubmit = async (data: CreateAssignmentFormData) => {
      setIsSubmitting(true);

      try {
        const payload = {
          ...data,
          status: data.status === 'Draft' ? 0 : 1,
        };

        await apiClient.post('/assignment', payload);

        toast.success('Assignment created successfully!');
        router.push('/teacher/assignments');
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Failed to create assignment');
      } finally {
        setIsSubmitting(false);
      }
    };



  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Assignment</h1>
          <p className="mt-1 text-sm text-gray-600">Create a new assignment for your class</p>
        </div>
        <Link href="/teacher/assignments" className="text-primary-600 hover:text-primary-800">
          Back to Assignments
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input
            {...register('title')}
            type="text"
            placeholder="e.g., Chapter 5 Homework"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.title && <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Provide instructions or details..."
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Class *
              {loadingClasses && <span className="ml-2 text-xs text-gray-400">Loading...</span>}
            </label>
            <select
              {...register('classId')}
              disabled={loadingClasses}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
            >
              <option value="">{loadingClasses ? 'Loading classes...' : 'Select your class'}</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academicYear})
                </option>
              ))}
            </select>
            {errors.classId && <p className="mt-1 text-sm text-danger-600">{errors.classId.message}</p>}
            {!loadingClasses && classes.length === 0 && (
              <p className="mt-1 text-xs text-warning-600">No classes assigned to you yet.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject *
              {loadingSubjects && <span className="ml-2 text-xs text-gray-400">Loading...</span>}
            </label>
            <select
              {...register('subjectId')}
              disabled={!selectedClassId || loadingSubjects}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
            >
              <option value="">
                {!selectedClassId 
                  ? 'Select class first' 
                  : loadingSubjects 
                    ? 'Loading subjects...' 
                    : 'Select subject'}
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
            {errors.subjectId && <p className="mt-1 text-sm text-danger-600">{errors.subjectId.message}</p>}
            {selectedClassId && !loadingSubjects && subjects.length === 0 && (
              <p className="mt-1 text-xs text-warning-600">No subjects assigned for this class.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deadline *</label>
            <input
                {...register('deadline')}
                type="datetime-local"
                min={new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            {errors.deadline && <p className="mt-1 text-sm text-danger-600">{errors.deadline.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Marks *</label>
            <input
              {...register('maximumMarks', { valueAsNumber: true })}
              type="number"
              min="1"
              max="1000"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.maximumMarks && <p className="mt-1 text-sm text-danger-600">{errors.maximumMarks.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register('status')}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Draft">Save as Draft</option>
            <option value="Published">Publish Immediately</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Link
            href="/teacher/assignments"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}