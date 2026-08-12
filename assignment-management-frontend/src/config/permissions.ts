export const PERMISSIONS = {
  ADMIN: {
    VIEW_USERS: 'admin:view_users',
    CREATE_USER: 'admin:create_user',
    EDIT_USER: 'admin:edit_user',
    DELETE_USER: 'admin:delete_user',
    VIEW_CLASSES: 'admin:view_classes',
    MANAGE_CLASSES: 'admin:manage_classes',
    VIEW_SUBJECTS: 'admin:view_subjects',
    MANAGE_SUBJECTS: 'admin:manage_subjects',
    VIEW_ASSIGNMENTS: 'admin:view_assignments',
    MANAGE_SETTINGS: 'admin:manage_settings',
  },
  TEACHER: {
    CREATE_ASSIGNMENT: 'teacher:create_assignment',
    EDIT_ASSIGNMENT: 'teacher:edit_assignment',
    DELETE_ASSIGNMENT: 'teacher:delete_assignment',
    VIEW_SUBMISSIONS: 'teacher:view_submissions',
    GRADE_SUBMISSION: 'teacher:grade_submission',
    VIEW_CLASSES: 'teacher:view_classes',
  },
  STUDENT: {
    VIEW_ASSIGNMENTS: 'student:view_assignments',
    SUBMIT_ASSIGNMENT: 'student:submit_assignment',
    VIEW_SUBMISSIONS: 'student:view_submissions',
    VIEW_GRADES: 'student:view_grades',
  },
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

export const rolePermissions: Record<string, string[]> = {
  Admin: Object.values(PERMISSIONS.ADMIN),
  Teacher: Object.values(PERMISSIONS.TEACHER),
  Student: Object.values(PERMISSIONS.STUDENT),
};

export function hasPermission(role: string, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}