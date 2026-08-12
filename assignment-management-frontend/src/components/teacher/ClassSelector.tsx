'use client';

import { useState, useEffect } from 'react';
import Select from '@/components/ui/Select';
import { apiClient } from '@/services/api-client';

interface ClassOption { id: string; name: string; }
interface SubjectOption { id: string; name: string; }

interface ClassSelectorProps {
  onClassChange: (classId: string) => void;
  onSubjectChange: (subjectId: string) => void;
}

export default function ClassSelector({ onClassChange, onSubjectChange }: ClassSelectorProps) {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    apiClient.get<ClassOption[]>('/teacher/classes').then(setClasses);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      apiClient.get<SubjectOption[]>(`/teacher/classes/${selectedClass}/subjects`).then(setSubjects);
      onClassChange(selectedClass);
    } else {
      setSubjects([]);
    }
  }, [selectedClass]);

  return (
    <div className="flex gap-4">
      <Select
        label="Class"
        options={[{ value: '', label: 'Select Class' }, ...classes.map((c) => ({ value: c.id, label: c.name }))]}
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      />
      <Select
        label="Subject"
        options={[{ value: '', label: 'Select Subject' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]}
        onChange={(e) => onSubjectChange(e.target.value)}
        disabled={!selectedClass}
      />
    </div>
  );
}