'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      await apiClient.put(`/user/${user?.id}`, data);
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed');
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-success-100 flex items-center justify-center">
            <span className="text-success-600 text-xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold">{user?.firstName} {user?.lastName}</h2>
            <span className="text-sm text-white bg-success-600 px-2 py-0.5 rounded-full">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Update Information</h2>
        <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input {...profileForm.register('firstName')} className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input {...profileForm.register('lastName')} className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input {...profileForm.register('email')} type="email" className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <button type="submit" disabled={isUpdatingProfile} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {isUpdatingProfile ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input {...passwordForm.register('currentPassword')} type="password" className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input {...passwordForm.register('newPassword')} type="password" className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input {...passwordForm.register('confirmPassword')} type="password" className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
            {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-danger-600">{passwordForm.formState.errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isChangingPassword} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}