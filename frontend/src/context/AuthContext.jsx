import { createContext, useState, useEffect, useCallback } from 'react';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';
import authService from '../services/authService';


export const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Validate the stored token against the backend — catches expired/revoked tokens
    authService.getProfile()
      .then(({ user: freshUser }) => {
        setToken(storedToken);
        setUser(freshUser);
      })
      .catch(() => {
        // Token is invalid or expired — clear stale session
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, authToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

