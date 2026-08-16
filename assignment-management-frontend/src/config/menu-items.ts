export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  roles: string[];
  divider?: boolean;
}

export const adminMenu: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', path: '/admin', roles: ['Admin'] },
  { key: 'users', label: 'User Management', icon: 'users', path: '/admin/users', roles: ['Admin'] },
  { key: 'classes', label: 'Classes', icon: 'academic-cap', path: '/admin/classes', roles: ['Admin'] },
  { key: 'subjects', label: 'Subjects', icon: 'book-open', path: '/admin/subjects', roles: ['Admin'] },
  { key: 'assignments', label: 'Assignments', icon: 'clipboard-list', path: '/admin/assignments', roles: ['Admin'] },
  { key: 'divider-1', label: '', roles: ['Admin'], divider: true },
  { key: 'profile', label: 'Profile', icon: 'user', path: '/admin/profile', roles: ['Teacher'] },
  { key: 'settings', label: 'Settings', icon: 'cog', path: '/admin/settings', roles: ['Admin'] },
];

export const teacherMenu: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', path: '/teacher', roles: ['Teacher'] },
  { key: 'assignments', label: 'My Assignments', icon: 'clipboard-list', path: '/teacher/assignments', roles: ['Teacher'] },
  { key: 'create-assignment', label: 'Create Assignment', icon: 'plus', path: '/teacher/assignments/create', roles: ['Teacher'] },
  { key: 'classes', label: 'My Classes', icon: 'academic-cap', path: '/teacher/classes', roles: ['Teacher'] },
  { key: 'divider-1', label: '', roles: ['Teacher'], divider: true },
  { key: 'profile', label: 'Profile', icon: 'user', path: '/teacher/profile', roles: ['Teacher'] },
];

export const studentMenu: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', path: '/student', roles: ['Student'] },
  { key: 'assignments', label: 'Assignments', icon: 'clipboard-list', path: '/student/assignments', roles: ['Student'] },
  { key: 'submissions', label: 'My Submissions', icon: 'document-text', path: '/student/submissions', roles: ['Student'] },
  { key: 'divider-1', label: '', roles: ['Student'], divider: true },
  { key: 'profile', label: 'Profile', icon: 'user', path: '/student/profile', roles: ['Student'] },
];

export const allMenus: Record<string, MenuItem[]> = {
  Admin: adminMenu,
  Teacher: teacherMenu,
  Student: studentMenu,
};