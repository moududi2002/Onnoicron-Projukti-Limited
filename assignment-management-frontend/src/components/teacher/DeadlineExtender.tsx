'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';

interface DeadlineExtenderProps {
  assignmentId: string;
  currentDeadline: string;
  onExtended: () => void;
}

export default function DeadlineExtender({ assignmentId, currentDeadline, onExtended }: DeadlineExtenderProps) {
  const [newDeadline, setNewDeadline] = useState(currentDeadline.slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExtend = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/assignment/${assignmentId}`, { deadline: newDeadline });
      toast.success('Deadline extended');
      onExtended();
    } catch (error: any) {
      toast.error(error.message || 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-medium">Extend Deadline</h3>
      <Input label="New Deadline" type="datetime-local" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} />
      <Button onClick={handleExtend} loading={isSubmitting}>Extend Deadline</Button>
    </div>
  );
}