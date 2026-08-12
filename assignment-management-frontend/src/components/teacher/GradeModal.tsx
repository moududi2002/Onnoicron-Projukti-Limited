'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import GradingForm from './GradingForm';
import { Submission } from '@/types';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/services/api-client';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  onGraded: () => void;
}

export default function GradeModal({ isOpen, onClose, submission, onGraded }: GradeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGrade = async (data: any) => {
    if (!submission) return;
    setIsSubmitting(true);
    try {
      await apiClient.put(`/submission/${submission.id}/grade`, data);
      toast.success('Submission graded');
      onGraded();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Grade Submission" size="lg">
      {submission && (
        <GradingForm submission={submission} onSubmit={handleGrade} isSubmitting={isSubmitting} />
      )}
    </Modal>
  );
}