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

  // Hydrate synchronously from localStorage so a returning visitor is
  // authenticated on the very first render — no blocking spinner while the
  // token is validated. This is what removes the "app hangs briefly on
  // refresh" symptom: the cold-start /auth/me round-trip no longer gates the UI.
  const [token, setToken] = useState(() => localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN));
  const [user, setUser]   = useState(() => readCachedUser());

  // Only block the UI in the rare case where we have a token but no cached
  // user to render with; otherwise the app renders immediately.
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

    // Validate/refresh in the background. The session is already live from the
    // cached values above, so this call can only *upgrade* it (fresh user) or
    // *revoke* it (a genuine 401). A longer per-request timeout absorbs cold
    // starts; a timeout or network error deliberately leaves the session intact
    // so a slow/asleep backend never logs a valid user out.
    authService.getProfile({ timeout: 20_000 })
      .then(({ user: freshUser }) => {
        if (cancelled) return;
        setUser(freshUser);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(freshUser));
      })
      .catch((err) => {
        if (cancelled) return;
        // Only a real 401 means the token is invalid/expired — clear it.
        // (Note: /auth/me is exempt from the 401 redirect interceptor, so the
        // error reaches us here and we handle the logout ourselves.)
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
