/**
 * Auth Context - Timi Admin Dashboard
 * Manages admin authentication state
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminInfo {
  userId?: number;
  accountId?: string;
  username?: string;
  role?: string;
}

interface AuthContextType {
  token: string | null;
  adminInfo: AdminInfo | null;
  isAuthenticated: boolean;
  setAuth: (token: string, info: AdminInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  adminInfo: null,
  isAuthenticated: false,
  setAuth: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('adminToken'));
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(() => {
    const stored = localStorage.getItem('adminInfo');
    return stored ? JSON.parse(stored) : null;
  });

  const setAuth = (newToken: string, info: AdminInfo) => {
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('adminInfo', JSON.stringify(info));
    setToken(newToken);
    setAdminInfo(info);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setToken(null);
    setAdminInfo(null);
  };

  return (
    <AuthContext.Provider value={{
      token,
      adminInfo,
      isAuthenticated: !!token,
      setAuth,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
