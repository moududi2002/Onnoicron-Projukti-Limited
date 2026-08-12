import { Submission } from '@/types';
import { HiStar, HiLightBulb } from 'react-icons/hi';

interface FeedbackDisplayProps {
  submission: Submission;
}

export default function FeedbackDisplay({ submission }: FeedbackDisplayProps) {
  if (!submission.isGraded) return null;

  const percentage = submission.marks && submission.maximumMarks
    ? (submission.marks / submission.maximumMarks) * 100
    : 0;

  const getGradeColor = (pct: number) => {
    if (pct >= 90) return 'text-success-600';
    if (pct >= 70) return 'text-primary-600';
    if (pct >= 50) return 'text-warning-600';
    return 'text-danger-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold flex items-center">
        <HiStar className="h-5 w-5 text-warning-500 mr-2" />
        Grade & Feedback
      </h2>

      <div className="bg-success-50 border border-success-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Marks Obtained</span>
          <span className={`text-2xl font-bold ${getGradeColor(percentage)}`}>
            {submission.marks}/{submission.maximumMarks}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-success-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</p>
      </div>

      {submission.feedback && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <HiLightBulb className="h-4 w-4 text-primary-500 mr-1" />
            Teacher Feedback
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-800 text-sm whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        </div>
      )}

      {submission.gradedAt && (
        <p className="text-xs text-gray-400">
          Graded on {new Date(submission.gradedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}