// src/app/(dashboard)/teacher/assignments/[id]/submissions/[submissionId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import { Submission } from '@/types';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';

const gradeSchema = z.object({
  marks: z.number().min(0),
  feedback: z.string().optional(),
  status: z.enum(['Graded', 'Rejected', 'Resubmitted']),
});

type GradeFormData = z.infer<typeof gradeSchema>;

export default function GradeSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const submissionId = params.submissionId as string;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
  });

  useEffect(() => {
    apiClient.get<Submission>(`/submission/${submissionId}`).then((data) => {
      setSubmission(data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load');
      router.back();
    });
  }, [submissionId]);

  const onSubmit = async (data: GradeFormData) => {
    if (submission && data.marks > (submission.maximumMarks || 100)) {
      toast.error(`Marks cannot exceed ${submission.maximumMarks}`);
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.put(`/submission/${submissionId}/grade`, data);
      toast.success('Graded successfully');
      router.push(`/teacher/assignments/${assignmentId}/submissions`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!submission) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/teacher/assignments/${assignmentId}/submissions`} className="inline-flex items-center text-gray-600"><HiArrowLeft className="mr-2" />Back</Link>
      <h1 className="text-2xl font-bold">Grade Submission</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium">Student: {submission.studentName}</h2>
          <p className="text-sm text-gray-500">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Submission Content:</h3>
          <p className="whitespace-pre-wrap">{submission.content}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Marks (Max: {submission.maximumMarks || 100})</label>
            <input {...register('marks', { valueAsNumber: true })} type="number" className="mt-1 block w-full rounded-lg border-gray-300" />
            {errors.marks && <p className="mt-1 text-sm text-danger-600">{errors.marks.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Feedback</label>
            <textarea {...register('feedback')} rows={4} className="mt-1 block w-full rounded-lg border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select {...register('status')} className="mt-1 block w-full rounded-lg border-gray-300">
              <option value="Graded">Graded</option>
              <option value="Rejected">Rejected</option>
              <option value="Resubmitted">Request Resubmission</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}