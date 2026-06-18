import { useEffect, useMemo, useState } from 'react';

import { authService } from '../../services/authService';
import { clearStoredToken, getStoredToken, setStoredToken } from '../../services/api/tokenStorage';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(getStoredToken()));
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setIsBootstrapping(false);
        setUser(null);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setAuthError('');
      } catch (error) {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setAuthError(error.message);
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrap();
  }, [token]);

  async function login(credentials) {
    const response = await authService.login(credentials);
    setStoredToken(response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
    setAuthError('');
    return response.user;
  }

  async function register(payload) {
    const response = await authService.register(payload);
    setStoredToken(response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
    setAuthError('');
    return response.user;
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      authError,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [token, user, isBootstrapping, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
