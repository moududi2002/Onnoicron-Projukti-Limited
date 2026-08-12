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
  marks: z.number().min(0),
  feedback: z.string().optional(),
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
      status: (submission.status as any) || 'Graded',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Student Submission:</h4>
        <p className="whitespace-pre-wrap text-sm">{submission.content}</p>
        <p className="text-xs text-gray-500 mt-2">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
      </div>

      <Input
        label={`Marks (Max: ${submission.maximumMarks || 100})`}
        type="number"
        {...register('marks', { valueAsNumber: true })}
        error={errors.marks?.message}
      />

      <TextArea label="Feedback" {...register('feedback')} rows={4} placeholder="Provide feedback to the student..." />

      <Select
        label="Status"
        options={[
          { value: 'Graded', label: 'Graded' },
          { value: 'Rejected', label: 'Rejected' },
          { value: 'Resubmitted', label: 'Request Resubmission' },
        ]}
        {...register('status')}
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Grade</Button>
      </div>
    </form>
  );
}