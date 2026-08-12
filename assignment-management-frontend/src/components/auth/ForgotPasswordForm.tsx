'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiClient } from '@/services/api-client';

const schema = z.object({ email: z.string().email('Invalid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setIsSent(true);
      toast.success('Reset link sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">Check Your Email</h3>
        <p className="text-gray-600 mt-2">We've sent a reset link to your email.</p>
        <Link href="/login" className="text-primary-600 mt-4 inline-block">Back to Login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message} placeholder="you@example.com" />
      <Button type="submit" loading={isSubmitting} className="w-full">Send Reset Link</Button>
      <p className="text-center text-sm"><Link href="/login" className="text-primary-600">Back to Login</Link></p>
    </form>
  );
}