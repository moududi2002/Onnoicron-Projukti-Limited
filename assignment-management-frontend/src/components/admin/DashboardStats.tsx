import { HiUsers, HiAcademicCap, HiBookOpen, HiClipboardList, HiCheckCircle, HiClock } from 'react-icons/hi';

interface StatsProps {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    totalAssignments: number;
    totalSubmissions: number;
    pendingGrading: number;
    averageGrade: number;
  };
}

export default function DashboardStats({ stats }: StatsProps) {
  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: HiUsers, color: 'bg-primary-500' },
    { label: 'Students', value: stats.totalStudents, icon: HiUsers, color: 'bg-success-500' },
    { label: 'Teachers', value: stats.totalTeachers, icon: HiAcademicCap, color: 'bg-warning-500' },
    { label: 'Classes', value: stats.totalClasses, icon: HiBookOpen, color: 'bg-danger-500' },
    { label: 'Subjects', value: stats.totalSubjects, icon: HiBookOpen, color: 'bg-indigo-500' },
    { label: 'Assignments', value: stats.totalAssignments, icon: HiClipboardList, color: 'bg-purple-500' },
    { label: 'Submissions', value: stats.totalSubmissions, icon: HiCheckCircle, color: 'bg-cyan-500' },
    { label: 'Pending Grading', value: stats.pendingGrading, icon: HiClock, color: 'bg-orange-500' },
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
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}