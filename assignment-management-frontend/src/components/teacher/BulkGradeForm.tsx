'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';

interface BulkGradeFormProps {
  assignmentId: string;
  maxMarks: number;
  onComplete: () => void;
}

export default function BulkGradeForm({ assignmentId, maxMarks, onComplete }: BulkGradeFormProps) {
  const [marks, setMarks] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBulkGrade = async () => {
    if (marks < 0 || marks > maxMarks) {
      toast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post(`/submission/assignment/${assignmentId}/bulk-grade`, { marks });
      toast.success('Bulk grading completed');
      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-medium">Bulk Grade All Ungraded Submissions</h3>
      <Input
        label={`Marks (0-${maxMarks})`}
        type="number"
        value={marks}
        onChange={(e) => setMarks(Number(e.target.value))}
      />
      <Button onClick={handleBulkGrade} loading={isSubmitting} variant="warning">
        Apply Bulk Grade
      </Button>
    </div>
  );
}