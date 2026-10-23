import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  college: {
    _id: string;
    name: string;
    code: string;
    city?: string;
    state?: string;
  };
  role: 'student' | 'moderator' | 'admin';
  isVerified: boolean;
  isOnboarded: boolean;
  department?: string;
  academicYear?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  avatarUrl?: string;
  privacySettings?: {
    profileVisibility: 'college' | 'public' | 'private';
    showEmail: boolean;
    allowDirectMessages: boolean;
  };
  blockedUsers?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('campusconnect_token')
  );
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('campusconnect_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem('campusconnect_token');
    localStorage.removeItem('campusconnect_user');
    setToken(null);
    setUser(null);
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('campusconnect_token', newToken);
    localStorage.setItem('campusconnect_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('campusconnect_user', JSON.stringify(merged));
  };

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('campusconnect_user', JSON.stringify(data.user));
      }
    } catch (err: any) {
      if (err.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
