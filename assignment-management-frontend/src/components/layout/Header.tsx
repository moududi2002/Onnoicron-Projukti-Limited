// src/components/shared/UserProfile.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import {
  HiCamera,
  HiUser,
  HiMail,
  HiPhone,
  HiLocationMarker,
} from 'react-icons/hi';
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

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  // User load হলে form data বসাবে
  useEffect(() => {
    if (!user) return;

    reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    });
  }, [user, reset]);

  const getProfileImageUrl = (path?: string) => {
    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
  };

  const startEditing = () => {
    console.log('UPDATE PROFILE CLICKED');

    // Current user data form-এ বসাও
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });

    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });

    setIsEditing(false);
  };

  // =========================
  // IMAGE UPLOAD
  // =========================

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    setUploadingImage(true);

    try {
      const result = await apiClient.uploadFile<FileUploadResult>(
        `/fileupload/profile/${user.id}`,
        file
      );

      const profilePicture = result.fileUrl;

      await apiClient.put(`/user/${user.id}`, {
        profilePicture,
      });

      updateUser({
        profilePicture,
      });

      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // =========================
  // SAVE PROFILE
  // =========================

  const onSubmit = async (data: ProfileFormData) => {
    console.log('FORM SUBMIT:', data);

    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedData = {
        ...data,
        profilePicture: user.profilePicture || undefined,
      };

      console.log('SENDING TO API:', updatedData);

      await apiClient.put(`/user/${user.id}`, updatedData);

      updateUser({
        ...data,
        profilePicture: user.profilePicture,
      });

      reset(data);

      setIsEditing(false);

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('PROFILE UPDATE ERROR:', error);

      toast.error(
        error?.message || 'Failed to update profile'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold text-gray-900">
        My Profile
      </h1>

      {/* ================= PROFILE HEADER ================= */}

      <div className="bg-white rounded-lg shadow p-6">

        <div className="flex items-center space-x-6">

          {/* IMAGE */}

          <div className="relative">

            {user?.profilePicture ? (
              <img
                src={getProfileImageUrl(user.profilePicture)}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-2 border-primary-200"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary-100 border-2 border-primary-200 flex items-center justify-center">
                <HiUser className="h-12 w-12 text-primary-400" />
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isEditing || uploadingImage}
              className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50"
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

          {/* USER INFO */}

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>

            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
              {user?.role}
            </span>

            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <HiMail className="h-4 w-4 mr-1" />
              {user?.email}
            </p>
          </div>

        </div>

      </div>

      {/* ================= FORM ================= */}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >

        <div className="flex justify-between items-center">

          <h2 className="text-lg font-semibold text-gray-900">
            Profile Information
          </h2>

          {/* DEBUG */}
          <span className="text-xs text-gray-400">
            {isEditing ? 'EDIT MODE' : 'VIEW MODE'}
          </span>

        </div>

        {/* FIRST NAME / LAST NAME */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>

            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>

            <input
              {...register('firstName')}
              disabled={!isEditing}
              className={`w-full border rounded-lg px-3 py-2 ${
                isEditing
                  ? 'bg-white border-primary-500'
                  : 'bg-gray-100'
              }`}
            />

            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.firstName.message}
              </p>
            )}

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>

            <input
              {...register('lastName')}
              disabled={!isEditing}
              className={`w-full border rounded-lg px-3 py-2 ${
                isEditing
                  ? 'bg-white border-primary-500'
                  : 'bg-gray-100'
              }`}
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lastName.message}
              </p>
            )}

          </div>

        </div>

        {/* EMAIL */}

        <div>

          <label className="block text-sm font-medium text-gray-700">
            <HiMail className="inline h-4 w-4 mr-1" />
            Email
          </label>

          <input
            {...register('email')}
            type="email"
            disabled={!isEditing}
            className={`w-full border rounded-lg px-3 py-2 ${
              isEditing
                ? 'bg-white border-primary-500'
                : 'bg-gray-100'
            }`}
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}

        </div>

        {/* PHONE */}

        <div>

          <label className="block text-sm font-medium text-gray-700">
            <HiPhone className="inline h-4 w-4 mr-1" />
            Phone
          </label>

          <input
            {...register('phone')}
            disabled={!isEditing}
            placeholder="+880..."
            className={`w-full border rounded-lg px-3 py-2 ${
              isEditing
                ? 'bg-white border-primary-500'
                : 'bg-gray-100'
            }`}
          />

        </div>

        {/* ADDRESS */}

        <div>

          <label className="block text-sm font-medium text-gray-700">
            <HiLocationMarker className="inline h-4 w-4 mr-1" />
            Address
          </label>

          <textarea
            {...register('address')}
            rows={3}
            disabled={!isEditing}
            placeholder="Your address..."
            className={`w-full border rounded-lg px-3 py-2 ${
              isEditing
                ? 'bg-white border-primary-500'
                : 'bg-gray-100'
            }`}
          />

        </div>

        {/* ================= BUTTONS ================= */}

        <div className="flex justify-end gap-3 pt-4 border-t">

          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </>
          )}

        </div>

      </form>

    </div>
  );
}
