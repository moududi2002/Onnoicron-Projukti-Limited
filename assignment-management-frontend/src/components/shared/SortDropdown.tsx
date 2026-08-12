import Select from '@/components/ui/Select';

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ options, value, onChange }: SortDropdownProps) {
  return (
    <Select
      options={options}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}