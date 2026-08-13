// src/contexts/AuthContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api-client';
import { User, LoginRequest, LoginResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<User>; // Promise<void> তুলে Promise<User> দিন
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Safely restore authentication state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore auth session from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

 const login = useCallback(async (credentials: LoginRequest): Promise<User> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

  const userData: User = {
    id: response.userId,
    username: response.username,
    email: response.email,
    role: response.role,
    firstName: response.firstName,
    lastName: response.lastName,
    isActive: true,
    createdAt: new Date().toISOString(),
    fullName: `${response.firstName} ${response.lastName}`,
  };

  setToken(response.token);
  setUser(userData);

  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(userData));

  if (response.role === 'Admin') {
    router.push('/admin');
  }
  else if (response.role === 'Teacher') {
    router.push('/teacher');
  }

  else if (response.role === 'Student') {
    router.push('/student');
  }

  // middleware.ts এর সুবিধার্থে Cookie তে টোকেন সেট করা
  document.cookie = `token=${response.token}; path=/; max-age=86400`;

  return userData; // userData রিটার্ন করা হলো যেন LoginForm সরাসরি পায়
}, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Prevent unnecessary re-renders of consumer components
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, token, isLoading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};