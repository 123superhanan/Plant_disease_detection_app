import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS/Web
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';
const API_URL = `${BASE_URL}/api/auth`;

type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        setUser(null);
        return;
      }

      // Note: Removed the redundant /api/auth prefix since it's in API_URL
      const res = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        await AsyncStorage.removeItem('userToken');
        setUser(null);
      }
    } catch (e) {
      console.log('AUTH CHECK ERROR', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Login failed');

      await AsyncStorage.setItem('userToken', data.token);
      setUser(data.user);
      router.replace('/(drawer)/Home');
    } catch (error: any) {
      console.error('Login error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Registration failed');

      await AsyncStorage.setItem('userToken', data.token);
      setUser(data.user);
      router.replace('/(drawer)/Home');
    } catch (error: any) {
      console.error('Register error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      setIsLoading(false);
      router.replace('/(auth)/register');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
