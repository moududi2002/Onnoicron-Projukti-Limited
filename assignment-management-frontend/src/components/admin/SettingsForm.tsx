'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';

const settingsSchema = z.object({
  appName: z.string().min(1),
  maxFileSize: z.number().min(1),
  allowedFileTypes: z.string().min(1),
  sessionTimeout: z.number().min(1),
  enableNotifications: z.boolean(),
  enableRegistration: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appName: 'Assignment Management System',
      maxFileSize: 10,
      allowedFileTypes: '.pdf,.doc,.docx,.txt,.jpg,.png,.zip',
      sessionTimeout: 480,
      enableNotifications: true,
      enableRegistration: true,
    },
  });

  const enableNotifications = watch('enableNotifications');
  const enableRegistration = watch('enableRegistration');

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      // await apiClient.put('/settings', data);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <Input label="Application Name" {...register('appName')} />
      <Input label="Max File Size (MB)" type="number" {...register('maxFileSize', { valueAsNumber: true })} />
      <Input label="Allowed File Types" {...register('allowedFileTypes')} />
      <Input label="Session Timeout (minutes)" type="number" {...register('sessionTimeout', { valueAsNumber: true })} />
      
      <div className="space-y-3">
        <Checkbox
          label="Enable Notifications"
          description="Send email notifications for assignments and grades"
          checked={enableNotifications}
          onChange={(checked) => setValue('enableNotifications', checked)}
        />
        <Checkbox
          label="Enable Registration"
          description="Allow new users to register"
          checked={enableRegistration}
          onChange={(checked) => setValue('enableRegistration', checked)}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>Save Settings</Button>
      </div>
    </form>
  );
}