// src/app/(dashboard)/student/assignments/[id]/submit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import { Assignment } from '@/types';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';

const submitSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000),
});

type SubmitFormData = z.infer<typeof submitSchema>;

export default function SubmitAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
  });

  useEffect(() => {
    apiClient.get<Assignment>(`/assignment/${assignmentId}`)
      .then(setAssignment)
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [assignmentId]);

  const onSubmit = async (data: SubmitFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/submission', {
        assignmentId,
        content: data.content,
      });
      toast.success('Assignment submitted successfully!');
      router.push('/student/submissions');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!assignment) return <p className="text-center py-12">Not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/student/assignments/${assignmentId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <HiArrowLeft className="mr-2 h-5 w-5" /> Back
      </Link>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Submit Assignment</h1>
        <p className="text-gray-600 mb-6">{assignment.title}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer <span className="text-danger-500">*</span>
            </label>
            <textarea
              {...register('content')}
              rows={10}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Write your answer here..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-danger-600">{errors.content.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Deadline: {new Date(assignment.deadline).toLocaleString()}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}