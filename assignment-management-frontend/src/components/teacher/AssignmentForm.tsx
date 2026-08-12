'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  maximumMarks: z.number().min(1).max(1000),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  status: z.enum(['Draft', 'Published']),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface ClassOption { id: string; name: string; }
interface SubjectOption { id: string; name: string; }

interface AssignmentFormProps {
  classes: ClassOption[];
  subjects: SubjectOption[];
  initialData?: Partial<AssignmentFormData>;
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  isSubmitting: boolean;
  onClassChange: (classId: string) => void;
}

export default function AssignmentForm({ classes, subjects, initialData, onSubmit, isSubmitting, onClassChange }: AssignmentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { status: 'Draft', maximumMarks: 100, ...initialData },
  });

  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));
  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input label="Title" {...register('title')} error={errors.title?.message} />
      <TextArea label="Description" {...register('description')} rows={4} />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Class"
          options={classOptions}
          {...register('classId')}
          error={errors.classId?.message}
          onChange={(e) => { register('classId').onChange(e); onClassChange(e.target.value); }}
        />
        <Select label="Subject" options={subjectOptions} {...register('subjectId')} error={errors.subjectId?.message} />
        <Input label="Deadline" type="datetime-local" {...register('deadline')} error={errors.deadline?.message} />
        <Input label="Maximum Marks" type="number" {...register('maximumMarks', { valueAsNumber: true })} error={errors.maximumMarks?.message} />
      </div>
      <Select
        label="Status"
        options={[{ value: 'Draft', label: 'Draft' }, { value: 'Published', label: 'Publish Now' }]}
        {...register('status')}
      />
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{initialData ? 'Update' : 'Create'} Assignment</Button>
      </div>
    </form>
  );
}