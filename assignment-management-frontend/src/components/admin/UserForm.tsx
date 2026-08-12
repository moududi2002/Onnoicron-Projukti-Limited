'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { User } from '@/types';

const userSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  username: z.string().min(3, 'Min 3 characters'),
  email: z.string().email('Invalid email'),
  role: z.enum(['Admin', 'Teacher', 'Student']),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function UserForm({ initialData, onSubmit, isSubmitting }: UserFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      username: initialData.username,
      email: initialData.email,
      role: initialData.role as any,
    } : { role: 'Student' },
  });

  const roleOptions = [
    { value: 'Student', label: 'Student' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Admin', label: 'Admin' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
        <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
      </div>
      <Input label="Username" {...register('username')} error={errors.username?.message} />
      <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
      <Select label="Role" options={roleOptions} {...register('role')} error={errors.role?.message} />
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{initialData ? 'Update' : 'Create'} User</Button>
      </div>
    </form>
  );
}