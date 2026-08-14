// src/app/(dashboard)/admin/profile/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import { HiCamera, HiUser } from 'react-icons/hi';
import { FileUploadResult } from '@/types';

//import { HiCamera, HiUser, HiMail, HiPhone, HiMapPin } from 'react-icons/hi';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

        try {
            if (!user?.id) {
                toast.error('User not found');
                return;
            }

        const result = await apiClient.uploadFile<FileUploadResult>(
                `/fileupload/profile/${user.id}`,
            file
        );

        updateUser({
            profilePicture: result.fileUrl,
        });

        toast.success('Profile picture updated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }

  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/user/${user?.id}`, data);
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                <HiUser className="h-12 w-12 text-primary-400" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700"
              disabled={uploadingImage}
            >
              <HiCamera className="h-4 w-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-500">{user?.role}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Update Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input {...register('firstName')} className="mt-1 block w-full rounded-lg border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input {...register('lastName')} className="mt-1 block w-full rounded-lg border-gray-300" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input {...register('email')} type="email" className="mt-1 block w-full rounded-lg border-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input {...register('phone')} className="mt-1 block w-full rounded-lg border-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea {...register('address')} rows={2} className="mt-1 block w-full rounded-lg border-gray-300" />
        </div>
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}