import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';
import authService from '../services/authService';


export const AuthContext = createContext(null);


// Safely read the user cached at login. Corrupt JSON must not crash app boot.
function readCachedUser() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


export function AuthProvider({ children }) {

  // Hydrate synchronously from localStorage so a returning visitor is authenticated on the very first
  // render — no blocking spinner while /auth/me validates in the background (see effect below).
  const [token, setToken] = useState(() => localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN));
  const [user, setUser]   = useState(() => readCachedUser());

  // Only blocks the UI in the rare case of a token with no cached user to render with.
  const [isLoading, setIsLoading] = useState(() => {
    const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    return Boolean(storedToken) && !readCachedUser();
  });

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

  useEffect(() => {
    const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    // Validate/refresh in the background — can only *upgrade* the session (fresh user) or *revoke* it (a
    // genuine 401). A timeout/network error deliberately leaves it intact so a slow backend can't log anyone out.
    authService.getProfile({ timeout: 20_000 })
      .then(({ user: freshUser }) => {
        if (cancelled) return;
        setUser(freshUser);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(freshUser));
      })
      .catch((err) => {
        if (cancelled) return;
        // Only a real 401 means the token is invalid/expired — clear it (/auth/me is exempt from the
        // interceptor's auto-redirect, so the error reaches us here and we handle the logout ourselves).
        if (err.response?.status === 401) {
          logout();
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
