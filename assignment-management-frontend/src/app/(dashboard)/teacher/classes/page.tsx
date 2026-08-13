// src/app/(dashboard)/teacher/classes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api-client';
import { HiUsers, HiBookOpen } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { classService } from '@/services/class-service';


interface TeacherClass {
  id: string;
  name: string;
  description?: string;
  academicYear: string;
  studentCount: number;
  subjectCount: number;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classService.getTeacherClasses()
      .then(setClasses)
      .catch(() => toast.error('Failed to load classes'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
      
      {classes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <HiBookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No classes assigned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{cls.name}</h3>
              {cls.description && <p className="text-sm text-gray-600 mb-4">{cls.description}</p>}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center">
                  <HiUsers className="h-4 w-4 mr-1" /> {cls.studentCount} Students
                </span>
                <span className="flex items-center">
                  <HiBookOpen className="h-4 w-4 mr-1" /> {cls.subjectCount} Subjects
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-3">Academic Year: {cls.academicYear}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}