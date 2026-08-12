export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  UNAUTHORIZED: '/unauthorized',

  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    CREATE_USER: '/admin/users/create',
    EDIT_USER: (id: string) => `/admin/users/${id}`,
    VIEW_USER: (id: string) => `/admin/users/${id}/view`,
    CLASSES: '/admin/classes',
    CREATE_CLASS: '/admin/classes/create',
    EDIT_CLASS: (id: string) => `/admin/classes/${id}`,
    VIEW_CLASS: (id: string) => `/admin/classes/${id}/view`,
    SUBJECTS: '/admin/subjects',
    CREATE_SUBJECT: '/admin/subjects/create',
    EDIT_SUBJECT: (id: string) => `/admin/subjects/${id}`,
    ASSIGNMENTS: '/admin/assignments',
    VIEW_ASSIGNMENT: (id: string) => `/admin/assignments/${id}`,
    SETTINGS: '/admin/settings',
  },

  TEACHER: {
    DASHBOARD: '/teacher',
    ASSIGNMENTS: '/teacher/assignments',
    CREATE_ASSIGNMENT: '/teacher/assignments/create',
    EDIT_ASSIGNMENT: (id: string) => `/teacher/assignments/${id}`,
    VIEW_ASSIGNMENT: (id: string) => `/teacher/assignments/${id}/view`,
    SUBMISSIONS: (assignmentId: string) => `/teacher/assignments/${assignmentId}/submissions`,
    GRADE_SUBMISSION: (assignmentId: string, submissionId: string) =>
      `/teacher/assignments/${assignmentId}/submissions/${submissionId}`,
    CLASSES: '/teacher/classes',
    PROFILE: '/teacher/profile',
  },

  STUDENT: {
    DASHBOARD: '/student',
    ASSIGNMENTS: '/student/assignments',
    VIEW_ASSIGNMENT: (id: string) => `/student/assignments/${id}`,
    SUBMIT_ASSIGNMENT: (id: string) => `/student/assignments/${id}/submit`,
    SUBMISSIONS: '/student/submissions',
    VIEW_SUBMISSION: (id: string) => `/student/submissions/${id}`,
    PROFILE: '/student/profile',
  },
} as const;