// src/app/(dashboard)/admin/settings/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

const settingsSchema = z.object({
  appName: z.string().min(1),
  maxFileSize: z.number().min(1),
  allowedFileTypes: z.string().min(1),
  sessionTimeout: z.number().min(1),
  enableNotifications: z.boolean(),
  enableRegistration: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit } = useForm<SettingsFormData>({
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

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      // apiClient.put('/settings', data);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Application Name</label>
          <input {...register('appName')} type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max File Size (MB)</label>
          <input {...register('maxFileSize', { valueAsNumber: true })} type="number" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Allowed File Types</label>
          <input {...register('allowedFileTypes')} type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
          <input {...register('sessionTimeout', { valueAsNumber: true })} type="number" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div className="space-y-3">
          <label className="flex items-center">
            <input {...register('enableNotifications')} type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
            <span className="ml-2 text-sm">Enable Notifications</span>
          </label>
          <label className="flex items-center">
            <input {...register('enableRegistration')} type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
            <span className="ml-2 text-sm">Enable Registration</span>
          </label>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}