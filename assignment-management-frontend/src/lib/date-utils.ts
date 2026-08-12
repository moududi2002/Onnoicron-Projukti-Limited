export const dateUtils = {
  timeAgo: (date: string | Date): string => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  },
  isDeadlinePassed: (deadline: string): boolean => new Date(deadline) < new Date(),
  getTimeRemaining: (deadline: string): string => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return 'Deadline passed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days > 0 ? `${days}d ${hours}h` : `${hours}h remaining`;
  },
  formatForInput: (date: string | Date): string => new Date(date).toISOString().slice(0, 16),
};