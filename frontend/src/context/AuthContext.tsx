import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { login as loginService, register as registerService, logout as logoutService, googleLogin as googleLoginService } from '../services/api/authAPI';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await loginService(email, password);

      if (response.success && response.data) {
        const { user: loggedInUser, token: authToken } = response.data;

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        setUser(loggedInUser);
        setToken(authToken);

        navigate('/');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await googleLoginService(credential);

      if (response.success && response.data) {
        const { user: loggedInUser, token: authToken } = response.data;

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        setUser(loggedInUser);
        setToken(authToken);

        navigate('/');
      } else {
        setError(response.message || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await registerService(userData);

      if (response.success && response.data) {
        const { user: registeredUser, token: authToken } = response.data;

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(registeredUser));

        setUser(registeredUser);
        setToken(authToken);

        navigate('/');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await logoutService();

      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      setUser(null);
      setToken(null);

      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);

      if (user && token) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Update user error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, googleLogin, register, logout, updateUser }}>
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