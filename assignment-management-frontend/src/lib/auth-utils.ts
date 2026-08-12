export const authUtils = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') return localStorage.getItem('token');
    return null;
  },
  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
  getRole: (): string | null => {
    const user = authUtils.getUser();
    return user?.role || null;
  },
  isAuthenticated: (): boolean => !!authUtils.getToken(),
  hasRole: (roles: string[]): boolean => {
    const role = authUtils.getRole();
    return role ? roles.includes(role) : false;
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};