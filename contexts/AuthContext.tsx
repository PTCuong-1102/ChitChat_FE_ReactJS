import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
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

// Helper function to map backend user data to frontend format
const mapUserData = (backendUser: any): User => {
  return {
    ...backendUser,
    // Map backend fields to frontend compatibility fields
    name: backendUser.full_name || backendUser.name || 'User',
    username: backendUser.user_name || backendUser.username || 'unknown',
    avatar: backendUser.avatar_url || backendUser.avatar,
    // Keep original backend fields as well
    full_name: backendUser.full_name,
    user_name: backendUser.user_name,
    avatar_url: backendUser.avatar_url,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Check if user is authenticated on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuth = await apiService.isAuthenticated();
        if (isAuth) {
          const userProfile = await apiService.getProfile();
          const userToken = localStorage.getItem('token');
          console.log('👤 Raw user profile from backend:', userProfile);
          const mappedUser = mapUserData(userProfile);
          console.log('👤 Mapped user profile:', mappedUser);
          setUser(mappedUser);
          setToken(userToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to get user profile:', error);
        // If token is invalid, remove it
        await apiService.logout();
        setIsAuthenticated(false);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting login for:', email);
      setIsLoading(true);
      const response = await apiService.login({ email, password });
      console.log('AuthContext: Login successful, raw user:', response.user);
      const mappedUser = mapUserData(response.user);
      console.log('AuthContext: Mapped user:', mappedUser);
      setUser(mappedUser);
      setToken(response.token);
      setIsAuthenticated(true);
      console.log('AuthContext: User set in state');
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => {
    try {
      console.log('AuthContext: Starting registration');
      setIsLoading(true);
      // Map frontend field names to backend field names
      const backendUserData = {
        userName: userData.username, // Map username -> userName
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName
      };
      const response = await apiService.register(backendUserData);
      console.log('AuthContext: Registration successful, raw user:', response.user);
      const mappedUser = mapUserData(response.user);
      console.log('AuthContext: Mapped user:', mappedUser);
      setUser(mappedUser);
      setToken(response.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
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
