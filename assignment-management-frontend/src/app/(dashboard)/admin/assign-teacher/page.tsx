// src/app/(dashboard)/admin/assign-teacher/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import { HiUserGroup, HiCheckCircle, HiXCircle } from 'react-icons/hi';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  className?: string;
}

interface Class {
  id: string;
  name: string;
}

export default function AssignTeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [assignedTeachers, setAssignedTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teacherData, subjectData, classData] = await Promise.all([
        apiClient.get<Teacher[]>('/user/teachers'),
        apiClient.get<Subject[]>('/subject'),
        apiClient.get<Class[]>('/class/active'),
      ]);
      setTeachers(teacherData);
      setSubjects(subjectData);
      setClasses(classData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      fetchAssignedTeachers(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchAssignedTeachers = async (subjectId: string) => {
    try {
      const data = await apiClient.get<any[]>(`/subject/${subjectId}/teachers`);
      setAssignedTeachers(data);
    } catch (error) {
      console.error('Failed to fetch assigned teachers');
    }
  };

  const handleAssign = async () => {
    if (!selectedTeacher || !selectedSubject) {
      toast.error('Please select teacher and subject');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/subject/${selectedSubject}/assign-teacher/${selectedTeacher}`, {});
      toast.success('Teacher assigned successfully');
      setSelectedTeacher('');
      fetchAssignedTeachers(selectedSubject);
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (teacherId: string) => {
    if (!selectedSubject) return;
    
    if (!confirm('Remove this teacher from the subject?')) return;
    
    try {
      await apiClient.delete(`/subject/${selectedSubject}/remove-teacher/${teacherId}`);
      toast.success('Teacher removed');
      fetchAssignedTeachers(selectedSubject);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove teacher');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assign Teachers</h1>
        <p className="mt-1 text-sm text-gray-600">
          Assign teachers to subjects and classes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New Assignment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Teacher</label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose subject...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code}) - {subject.className || 'No class'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAssign}
              disabled={isSubmitting || !selectedTeacher || !selectedSubject}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Teacher'}
            </button>
          </div>
        </div>

        {/* Assigned Teachers List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Assigned Teachers
            {selectedSubject && (
              <span className="text-sm text-gray-500 ml-2">
                ({subjects.find(s => s.id === selectedSubject)?.name})
              </span>
            )}
          </h2>

          {!selectedSubject ? (
            <p className="text-gray-500 text-center py-8">Select a subject to view assigned teachers</p>
          ) : assignedTeachers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No teachers assigned to this subject</p>
          ) : (
            <div className="space-y-3">
              {assignedTeachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{teacher.firstName} {teacher.lastName}</p>
                      <p className="text-sm text-gray-500">{teacher.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(teacher.id)}
                    className="text-danger-500 hover:text-danger-700"
                  >
                    <HiXCircle className="h-6 w-6" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}