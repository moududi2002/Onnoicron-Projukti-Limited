export const formatters = {
  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },
  percentage: (value: number, total: number): string => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  },
  grade: (marks?: number, maxMarks?: number): string => {
    if (marks === undefined || maxMarks === undefined) return '-';
    return `${marks}/${maxMarks} (${formatters.percentage(marks, maxMarks)})`;
  },
};