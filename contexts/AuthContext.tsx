import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginPayload, RegisterPayload } from '../types';
import apiService from '../services/apiService';
import { errorHandler } from '../services/errorHandler';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const userProfile = await apiService.getProfile();
          setUser(userProfile);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // This likely means the token is invalid or expired
        errorHandler.handleError(error, 'checkAuthStatus');
        await apiService.logout(); // Ensure local state is cleared
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (payload: LoginPayload) => {
    try {
      setIsLoading(true);
      const { user, token } = await apiService.login(payload);
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      errorHandler.handleError(error, 'login');
      throw error; // Re-throw to be caught in the component
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      setIsLoading(true);
      const { user, token } = await apiService.register(payload);
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      errorHandler.handleError(error, 'register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } catch (error) {
      errorHandler.handleError(error, 'logout');
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
