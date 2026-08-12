'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { apiClient } from '@/services/api-client';

interface Student { id: string; firstName: string; lastName: string; }
interface Class { id: string; name: string; }

export default function StudentEnrollmentForm() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get<Student[]>('/user/students').then(setStudents);
    apiClient.get<Class[]>('/class/active').then(setClasses);
  }, []);

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedClass) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/class/${selectedClass}/add-student/${selectedStudent}`, {});
      toast.success('Student enrolled');
      setSelectedStudent('');
      setSelectedClass('');
    } catch (error: any) {
      toast.error(error.message || 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Enroll Student in Class</h3>
      <Select
        label="Student"
        options={students.map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))}
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
      />
      <Select
        label="Class"
        options={classes.map((c) => ({ value: c.id, label: c.name }))}
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      />
      <Button onClick={handleEnroll} loading={isSubmitting} disabled={!selectedStudent || !selectedClass}>
        Enroll Student
      </Button>
    </div>
  );
}