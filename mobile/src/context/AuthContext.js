import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, loadToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await loadToken();
      if (t) {
        try {
          const res = await api.me();
          setUser(res.user);
        } catch {
          await setToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    await setToken(res.token);
    setUser(res.user);
  };

  const signup = async (email, password, username) => {
    const res = await api.signup({ email, password, username });
    await setToken(res.token);
    setUser(res.user);
  };

  const completeOnboarding = async (data) => {
    const res = await api.onboarding(data);
    setUser(res.user);
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
  };

  const refreshUser = (u) => {
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, completeOnboarding, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
