// src/components/shared/UserProfile.tsx
'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import { HiCamera, HiUser, HiMail, HiPhone, HiLocationMarker, HiUpload } from 'react-icons/hi';
import { FileUploadResult } from '@/types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

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

      // Update user in context and localStorage
      updateUser({ profilePicture: result.fileUrl });

      // Also update in backend
      await apiClient.put(`/user/${user.id}`, { profilePicture: result.fileUrl });

      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const updatedData = {
        ...data,
        profilePicture: user?.profilePicture || undefined,
      };
      await apiClient.put(`/user/${user?.id}`, updatedData);
      updateUser(data);
      setIsEditing(false);
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

      {/* Profile Header with Picture */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {user?.profilePicture ? (
              <img 
                 src={`${process.env.NEXT_PUBLIC_API_URL}${user.profilePicture}`}
                 alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-2 border-primary-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary-100 border-2 border-primary-200 flex items-center justify-center">
                <HiUser className="h-12 w-12 text-primary-400" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors"
              disabled={!isEditing || uploadingImage}
              title="Upload profile picture"
            >
              {uploadingImage ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <HiCamera className="h-4 w-4" />
              )}
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/jpeg,image/png,image/gif,image/webp" 
              className="hidden" 
              onChange={handleImageUpload}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
              {user?.role}
            </span>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <HiMail className="h-4 w-4 mr-1" /> {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Update Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Update Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input 
              {...register('firstName')} 
              disabled={!isEditing}
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed" 
            />
            {errors.firstName && <p className="mt-1 text-sm text-danger-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input 
              {...register('lastName')} 
              disabled={!isEditing}
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed" 
            />
            {errors.lastName && <p className="mt-1 text-sm text-danger-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <HiMail className="h-4 w-4 mr-1" /> Email
          </label>
          <input 
            {...register('email')} 
            type="email" 
            disabled={!isEditing}
            className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed" 
          />
          {errors.email && <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <HiPhone className="h-4 w-4 mr-1" /> Phone
          </label>
          <input 
            {...register('phone')} 
            disabled={!isEditing}
            className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed" 
            placeholder="+880..." 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <HiLocationMarker className="h-4 w-4 mr-1" /> Address
          </label>
          <textarea 
            {...register('address')} 
            rows={2} 
            disabled={!isEditing}
            className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed" 
            placeholder="Your address..." 
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
              type={isEditing ? 'submit' : 'button'}
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              onClick={() => {
                if (!isEditing) {
                  setIsEditing(true);
                }
              }}
                >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                  ? 'Save'
                  : 'Update Profile'}
            </button>
        </div>
      </form>
    </div>
  );
}