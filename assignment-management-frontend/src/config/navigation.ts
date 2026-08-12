import {
  HiHome, HiUsers, HiAcademicCap, HiBookOpen,
  HiClipboardList, HiDocumentText, HiCog, HiUser,
} from 'react-icons/hi';

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: HiHome,
    roles: ['Admin', 'Teacher', 'Student'],
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: HiUsers,
    roles: ['Admin'],
    children: [
      { label: 'All Users', href: '/admin/users', icon: HiUsers, roles: ['Admin'] },
      { label: 'Create User', href: '/admin/users/create', icon: HiUsers, roles: ['Admin'] },
    ],
  },
  {
    label: 'Classes',
    href: '/admin/classes',
    icon: HiAcademicCap,
    roles: ['Admin'],
  },
  {
    label: 'Subjects',
    href: '/admin/subjects',
    icon: HiBookOpen,
    roles: ['Admin'],
  },
  {
    label: 'Assignments',
    href: '/teacher/assignments',
    icon: HiClipboardList,
    roles: ['Teacher', 'Student'],
    children: [
      { label: 'Create', href: '/teacher/assignments/create', icon: HiClipboardList, roles: ['Teacher'] },
      { label: 'My Assignments', href: '/teacher/assignments', icon: HiClipboardList, roles: ['Teacher'] },
      { label: 'Available', href: '/student/assignments', icon: HiClipboardList, roles: ['Student'] },
    ],
  },
  {
    label: 'Submissions',
    href: '/student/submissions',
    icon: HiDocumentText,
    roles: ['Student'],
  },
  {
    label: 'My Classes',
    href: '/teacher/classes',
    icon: HiAcademicCap,
    roles: ['Teacher'],
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: HiCog,
    roles: ['Admin'],
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: HiUser,
    roles: ['Teacher', 'Student'],
  },
];