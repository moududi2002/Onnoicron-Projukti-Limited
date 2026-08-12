import Select from '@/components/ui/Select';

interface AssignmentFiltersProps {
  statusFilter: string;
  classFilter: string;
  subjectFilter: string;
  onStatusChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  classes: { value: string; label: string }[];
  subjects: { value: string; label: string }[];
}

export default function AssignmentFilters({
  statusFilter, classFilter, subjectFilter,
  onStatusChange, onClassChange, onSubjectChange,
  classes, subjects,
}: AssignmentFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Select
        options={[
          { value: '', label: 'All Status' },
          { value: 'Draft', label: 'Draft' },
          { value: 'Published', label: 'Published' },
          { value: 'Closed', label: 'Closed' },
        ]}
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
      />
      <Select
        options={[{ value: '', label: 'All Classes' }, ...classes]}
        value={classFilter}
        onChange={(e) => onClassChange(e.target.value)}
      />
      <Select
        options={[{ value: '', label: 'All Subjects' }, ...subjects]}
        value={subjectFilter}
        onChange={(e) => onSubjectChange(e.target.value)}
      />
    </div>
  );
}