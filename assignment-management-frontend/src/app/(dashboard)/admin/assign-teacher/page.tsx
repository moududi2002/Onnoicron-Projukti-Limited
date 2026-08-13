// src/app/(dashboard)/admin/assign-teacher/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';
import { 
  HiUserGroup, HiXCircle, HiPencil, HiSearch, 
  HiCheckCircle, HiRefresh 
} from 'react-icons/hi';

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
  classId: string;
}

interface Class {
  id: string;
  name: string;
}

interface TeacherAssignment {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  assignedAt: string;
}

interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}


export default function AssignTeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  
  // Form state
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // Edit state
  const [editingAssignment, setEditingAssignment] = useState<TeacherAssignment | null>(null);
  const [newTeacherId, setNewTeacherId] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'assign' | 'view'>('assign');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [teacherData, subjectData, classData, assignmentData] = await Promise.all([
        apiClient.get<Teacher[]>('/user/teachers'),
        apiClient.get<PaginatedResponseDto<Subject>>('/subject'),
        apiClient.get<Class[]>('/class/active'),
        apiClient.get<TeacherAssignment[]>('/subject/teacher-assignments/all'),
      ]);
      setTeachers(teacherData);
      setSubjects(subjectData.data);
      setClasses(classData);
      setTeacherAssignments(assignmentData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Assign teacher
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
      setSelectedSubject('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove teacher
  const handleRemove = async (subjectId: string, teacherId: string) => {
    if (!confirm('Remove this teacher from the subject?')) return;
    
    try {
      await apiClient.delete(`/subject/${subjectId}/remove-teacher/${teacherId}`);
      toast.success('Teacher removed');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove teacher');
    }
  };

  // Update teacher
  const handleUpdate = async () => {
    if (!editingAssignment || !newTeacherId) {
      toast.error('Please select new teacher');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.put(
        `/subject/${editingAssignment.subjectId}/update-teacher/${editingAssignment.teacherId}/${newTeacherId}`,
        {}
      );
      toast.success('Teacher assignment updated');
      setEditingAssignment(null);
      setNewTeacherId('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAssignments = teacherAssignments.filter((ta) =>
    ta.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ta.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ta.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assign Teachers</h1>
          <p className="mt-1 text-sm text-gray-600">Assign, update, and remove teachers from subjects</p>
        </div>
        <button onClick={fetchData} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
          <HiRefresh className="mr-2 h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('assign')}
            className={`py-2 px-4 border-b-2 text-sm font-medium ${
              activeTab === 'assign' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'
            }`}
          >
            Assign New Teacher
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`py-2 px-4 border-b-2 text-sm font-medium ${
              activeTab === 'view' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'
            }`}
          >
            View All Assign Teacher ({teacherAssignments.length})
          </button>
        </nav>
      </div>

      {activeTab === 'assign' ? (
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
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <HiCheckCircle className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Assigning...' : 'Assign Teacher'}
              </button>
            </div>
          </div>

          {/* Edit Modal */}
          {editingAssignment && (
            <div className="bg-white rounded-lg shadow p-6 border-2 border-warning-300">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Update Assignment</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm"><strong>Subject:</strong> {editingAssignment.subjectName} ({editingAssignment.subjectCode})</p>
                  <p className="text-sm"><strong>Class:</strong> {editingAssignment.className}</p>
                  <p className="text-sm"><strong>Current Teacher:</strong> {editingAssignment.teacherName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select New Teacher</label>
                  <select
                    value={newTeacherId}
                    onChange={(e) => setNewTeacherId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Choose new teacher...</option>
                    {teachers
                      .filter((t) => t.id !== editingAssignment.teacherId)
                      .map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleUpdate}
                    disabled={isSubmitting || !newTeacherId}
                    className="flex-1 px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 disabled:opacity-50"
                  >
                    Update Assignment
                  </button>
                  <button
                    onClick={() => { setEditingAssignment(null); setNewTeacherId(''); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* View All Assignments Tab */
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by teacher, subject, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No teacher assignments found</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAssignments.map((ta) => (
                    <tr key={`${ta.subjectId}-${ta.teacherId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{ta.teacherName}</div>
                        <div className="text-xs text-gray-500">{ta.teacherEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ta.subjectName} ({ta.subjectCode})
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{ta.className}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(ta.assignedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingAssignment(ta);
                              setActiveTab('assign');
                            }}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit/Update"
                          >
                            <HiPencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRemove(ta.subjectId, ta.teacherId)}
                            className="text-danger-600 hover:text-danger-900"
                            title="Remove"
                          >
                            <HiXCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}