'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

const subjectSchema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required'),
  classId: z.string().min(1, 'Required'),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface ClassOption { id: string; name: string; }

interface SubjectFormProps {
  classes: ClassOption[];
  initialData?: SubjectFormData & { isActive?: boolean };
  onSubmit: (data: SubjectFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function SubjectForm({ classes, initialData, onSubmit, isSubmitting }: SubjectFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: initialData || {},
  });

  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input label="Subject Name" {...register('name')} error={errors.name?.message} placeholder="e.g., Mathematics" />
      <Input label="Subject Code" {...register('code')} error={errors.code?.message} placeholder="e.g., MATH101" />
      <Select label="Class" options={classOptions} {...register('classId')} error={errors.classId?.message} />
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{initialData ? 'Update' : 'Create'} Subject</Button>
      </div>
    </form>
  );
}