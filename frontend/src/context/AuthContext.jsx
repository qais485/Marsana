import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api/authService';
import { profileService } from '../services/api/profileService';

const AuthContext = createContext(null);

function getInitialUser() {
  const token = localStorage.getItem('access_token');
  const userData = localStorage.getItem('user');

  if (token && userData) {
    try {
      return JSON.parse(userData);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        setIsValidating(false);
        return;
      }

      try {
        const response = await profileService.getProfile();
        if (response.success) {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } else {
          throw new Error('Invalid response');
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  const login = async (email, password, deviceName, deviceType) => {
    const response = await authService.login({
      email,
      password,
      device_name: deviceName,
      device_type: deviceType,
    });

    if (!response.success) {
      throw new Error(response.message || 'Login failed');
    }

    if (response.data.requires_verification) {
      return { requiresVerification: true, email: response.data.email };
    }

    if (response.data.requires_2fa) {
      return { requires2FA: true, tempToken: response.data.temp_token };
    }

    const { access_token, refresh_token, user: userData } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    return { success: true };
  };

  const register = async (data) => {
    const response = await authService.register(data);
    return response;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // Ignore logout errors
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isValidating,
    login,
    register,
    logout,
    updateUser: (userData) => {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    },
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
