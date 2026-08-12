interface Activity {
  id: string;
  activityType: string;
  description: string;
  userName: string;
  timestamp: string;
  timeAgo?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const activityColors: Record<string, string> = {
  AssignmentCreated: 'bg-blue-100 text-blue-800',
  AssignmentPublished: 'bg-green-100 text-green-800',
  SubmissionReceived: 'bg-purple-100 text-purple-800',
  SubmissionGraded: 'bg-success-100 text-success-800',
  LateSubmission: 'bg-warning-100 text-warning-800',
  StudentEnrolled: 'bg-indigo-100 text-indigo-800',
};

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  if (!activities.length) {
    return <p className="text-gray-500 text-center py-8">No recent activities</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-2 w-2 mt-2 rounded-full bg-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${activityColors[activity.activityType] || 'bg-gray-100 text-gray-800'}`}>
                {activity.activityType}
              </span>
            </div>
            <p className="text-sm text-gray-900 mt-1">{activity.description}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {activity.userName} • {activity.timeAgo || new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}