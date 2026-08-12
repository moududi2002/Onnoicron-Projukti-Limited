'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import FileUpload from '@/components/shared/FileUpload';
import { apiClient } from '@/services/api-client';

const submitSchema = z.object({
  content: z.string().min(10, 'Answer must be at least 10 characters').max(10000, 'Answer too long'),
});

type SubmitFormData = z.infer<typeof submitSchema>;

interface SubmissionFormProps {
  assignmentId: string;
  onSuccess: () => void;
}

export default function SubmissionForm({ assignmentId, onSuccess }: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
  });

  const onSubmit = async (data: SubmitFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/submission', {
        assignmentId,
        content: data.content,
      });
      toast.success('Assignment submitted!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <TextArea
        label="Your Answer"
        {...register('content')}
        error={errors.content?.message}
        rows={10}
        placeholder="Write your answer here..."
      />

      <FileUpload
        uploadUrl={`/fileupload/submission/temp`}
        onUploadComplete={() => {}}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} size="lg">
          Submit Assignment
        </Button>
      </div>
    </form>
  );
}