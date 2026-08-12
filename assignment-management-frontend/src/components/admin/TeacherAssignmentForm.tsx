'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { apiClient } from '@/services/api-client';

interface Teacher { id: string; firstName: string; lastName: string; }
interface Subject { id: string; name: string; }

export default function TeacherAssignmentForm() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get<Teacher[]>('/user/teachers').then(setTeachers);
    apiClient.get<Subject[]>('/subject').then(setSubjects);
  }, []);

  const handleAssign = async () => {
    if (!selectedTeacher || !selectedSubject) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/subject/${selectedSubject}/assign-teacher/${selectedTeacher}`, {});
      toast.success('Teacher assigned');
      setSelectedTeacher('');
      setSelectedSubject('');
    } catch (error: any) {
      toast.error(error.message || 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Assign Teacher to Subject</h3>
      <Select
        label="Teacher"
        options={teachers.map((t) => ({ value: t.id, label: `${t.firstName} ${t.lastName}` }))}
        value={selectedTeacher}
        onChange={(e) => setSelectedTeacher(e.target.value)}
      />
      <Select
        label="Subject"
        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
      />
      <Button onClick={handleAssign} loading={isSubmitting} disabled={!selectedTeacher || !selectedSubject}>
        Assign Teacher
      </Button>
    </div>
  );
}