import { HiClipboardList, HiCheckCircle, HiClock, HiUsers } from 'react-icons/hi';

interface Stats {
  totalAssignments: number;
  totalSubmissions: number;
  pendingGrading: number;
  totalStudents: number;
  averageGrade: number;
}

export default function TeacherStats({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'My Assignments', value: stats.totalAssignments, icon: HiClipboardList, color: 'bg-primary-500' },
    { label: 'Submissions', value: stats.totalSubmissions, icon: HiCheckCircle, color: 'bg-success-500' },
    { label: 'Pending Grading', value: stats.pendingGrading, icon: HiClock, color: 'bg-warning-500' },
    { label: 'Students', value: stats.totalStudents, icon: HiUsers, color: 'bg-purple-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}