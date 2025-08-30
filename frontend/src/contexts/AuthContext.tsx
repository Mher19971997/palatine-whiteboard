import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userUuid: string | null;
  login: (access: string, refresh: string, userUuid: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userUuid, setUserUuid] = useState<string | null>(null);

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    if (access && refresh) {
      setIsAuthenticated(true);
      setUserUuid(localStorage.getItem("user_uuid"));
    } else {
      setIsAuthenticated(false);
      setUserUuid(null);
    }
  }, []);

  const login = (access: string, refresh: string, userUuid: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user_uuid", userUuid);
    setIsAuthenticated(true);
    setUserUuid(userUuid);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_uuid");
    setIsAuthenticated(false);
    setUserUuid(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userUuid, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
