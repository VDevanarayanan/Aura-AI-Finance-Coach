import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../../../shared/types';
import { apiRequest, setAuthToken, getAuthToken } from '../utils/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserLocal: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest<{ user: UserProfile }>('/auth/me');
      setUser(response.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Remove invalid token
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{ token: string; user: UserProfile }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{ token: string; user: UserProfile }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateUserLocal = (updated: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerUser,
        logout,
        updateUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
