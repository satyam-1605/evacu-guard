import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('evacu_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('evacu_token');
          localStorage.removeItem('evacu_refresh');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { user, access_token, refresh_token } = res.data;
    localStorage.setItem('evacu_token', access_token);
    localStorage.setItem('evacu_refresh', refresh_token);
    setToken(access_token);
    setUser(user);
    return user;
  };

  const signup = async (data) => {
    const res = await api.post('/api/auth/signup', data);
    const { user, access_token, refresh_token } = res.data;
    localStorage.setItem('evacu_token', access_token);
    localStorage.setItem('evacu_refresh', refresh_token);
    setToken(access_token);
    setUser(user);
    return user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('evacu_token');
    localStorage.removeItem('evacu_refresh');
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = async (data) => {
    const res = await api.put('/api/auth/profile', data);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user, token,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isLoading,
      login, signup, logout, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
