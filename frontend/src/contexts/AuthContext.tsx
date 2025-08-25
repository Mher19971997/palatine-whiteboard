import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, userAPI } from '../api/endpoints';
import { toast } from '../utils/toast';

interface AuthContextType {
  isAuthenticated: boolean;
  userUuid: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userUuid, setUserUuid] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user'], // заменяем массив
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data;
    },
    enabled: !!localStorage.getItem('access_token'),
    onSuccess: (data: any) => {
      setUserUuid(data.uuid);          // <-- make sure this is uncommented
      setIsAuthenticated(true);        // <-- make sure this is uncommented
    },
    onError: () => {
      logout();
    },
  });
  useEffect(()=>{
    //@ts-ignore
    if(data){
      setUserUuid(data.uuid);          // <-- make sure this is uncommented
    }

  })
  console.log(data,"datadata");
  
  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);

    queryClient.invalidateQueries({ queryKey: ['user'] });
    toast.success('Successfully logged in!');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUserUuid(null);
    queryClient.removeQueries({ queryKey: ['user'] });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userUuid, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
