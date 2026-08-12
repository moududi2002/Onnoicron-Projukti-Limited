'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  description: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
});

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormProps {
  initialData?: ClassFormData;
  onSubmit: (data: ClassFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function ClassForm({ initialData, onSubmit, isSubmitting }: ClassFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input label="Class Name" {...register('name')} error={errors.name?.message} placeholder="e.g., Class 10-A" />
      <TextArea label="Description (Optional)" {...register('description')} rows={3} />
      <Input label="Academic Year" {...register('academicYear')} error={errors.academicYear?.message} placeholder="e.g., 2024-2025" />
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{initialData ? 'Update' : 'Create'} Class</Button>
      </div>
    </form>
  );
}