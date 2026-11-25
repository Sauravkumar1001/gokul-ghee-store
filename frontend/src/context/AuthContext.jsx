import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { disconnectOrderSocket } from '../services/socketClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(() => import.meta.env.MODE !== 'test');

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return;
    let active = true;
    authService
      .getCurrentUser()
      .then((res) => {
        if (active && res.ok && res.data?.user) {
          setUser(res.data.user);
        }
      })
      .finally(() => {
        if (active) setIsHydrating(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      if (result.ok && result.data?.user) {
        setUser(result.data.user);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setIsLoading(true);
    try {
      const result = await authService.register(payload);
      if (result.ok && result.data?.user) {
        setUser(result.data.user);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      disconnectOrderSocket();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isLoading,
      isHydrating,
      login,
      register,
      logout,
    }),
    [user, isLoading, isHydrating, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
