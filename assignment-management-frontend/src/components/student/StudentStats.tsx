import { HiClipboardList, HiCheckCircle, HiClock, HiChartBar } from 'react-icons/hi';

interface Stats {
  totalAssignments: number;
  totalSubmissions: number;
  pendingGrading: number;
  averageGrade: number;
}

export default function StudentStats({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Total Assignments', value: stats.totalAssignments, icon: HiClipboardList, color: 'bg-primary-500' },
    { label: 'Submitted', value: stats.totalSubmissions, icon: HiCheckCircle, color: 'bg-success-500' },
    { label: 'Pending', value: stats.pendingGrading, icon: HiClock, color: 'bg-warning-500' },
    { label: 'Avg Grade', value: `${stats.averageGrade}%`, icon: HiChartBar, color: 'bg-purple-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className={`${card.color} p-2 rounded-lg`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-xl font-bold">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}