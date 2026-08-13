// src/components/teacher/GradingForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import { Submission } from '@/types';

const gradeSchema = z.object({
  marks: z.number().min(0, 'Marks cannot be negative'),
  feedback: z.string().optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  grade: z.string().optional(),
  status: z.enum(['Graded', 'Rejected', 'Resubmitted']),
});

type GradeFormData = z.infer<typeof gradeSchema>;

interface GradingFormProps {
  submission: Submission;
  onSubmit: (data: GradeFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function GradingForm({ submission, onSubmit, isSubmitting }: GradingFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      marks: submission.marks || 0,
      feedback: submission.feedback || '',
      strengths: '',
      areasForImprovement: '',
      grade: '',
      status: (submission.status as any) || 'Graded',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Student Submission View */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Student Submission:</h4>
        <p className="whitespace-pre-wrap text-sm">{submission.content}</p>
        <p className="text-xs text-gray-500 mt-2">
          Submitted: {new Date(submission.submittedAt).toLocaleString()}
          {submission.isLate && <span className="text-warning-600 ml-2">(Late)</span>}
        </p>
      </div>

      {/* Marks */}
      <Input
        label={`Marks (Max: ${submission.maximumMarks || 100})`}
        type="number"
        {...register('marks', { valueAsNumber: true })}
        error={errors.marks?.message}
      />

      {/* Grade Letter */}
      <Select
        label="Grade (Optional)"
        options={[
          { value: '', label: 'Select Grade' },
          { value: 'A+', label: 'A+ (Excellent)' },
          { value: 'A', label: 'A (Very Good)' },
          { value: 'B', label: 'B (Good)' },
          { value: 'C', label: 'C (Satisfactory)' },
          { value: 'D', label: 'D (Poor)' },
          { value: 'F', label: 'F (Fail)' },
        ]}
        {...register('grade')}
      />

      {/* Detailed Feedback */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Feedback</h4>
        
        <TextArea
          label="Overall Feedback"
          {...register('feedback')}
          rows={4}
          placeholder="Provide comprehensive feedback to the student..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TextArea
            label="Strengths"
            {...register('strengths')}
            rows={3}
            placeholder="What did the student do well?"
          />
          <TextArea
            label="Areas for Improvement"
            {...register('areasForImprovement')}
            rows={3}
            placeholder="What can the student improve on?"
          />
        </div>
      </div>

      {/* Status */}
      <Select
        label="Status"
        options={[
          { value: 'Graded', label: 'Graded' },
          { value: 'Rejected', label: 'Rejected' },
          { value: 'Resubmitted', label: 'Request Resubmission' },
        ]}
        {...register('status')}
      />

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Save Grade & Feedback
        </Button>
      </div>
    </form>
  );
}