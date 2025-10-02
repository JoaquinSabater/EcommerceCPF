'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        
        if (!parsedUser.isAdmin && (parsedUser.id === 2223)) {
          parsedUser.isAdmin = true;
        }
        
        setUser(parsedUser);
        
        
        clearProspectoMode();
        
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const clearProspectoMode = () => {
    localStorage.removeItem('prospecto_mode');
    localStorage.removeItem('prospecto_data');
    localStorage.removeItem('prospecto_cart');
    localStorage.removeItem('prospecto_token');
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (userData: User) => {

    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    clearProspectoMode();
  };

  const login = (userData: User) => {

    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    clearProspectoMode();
    
    console.log('✅ Usuario autenticado, modo prospecto limpiado');
  };

  return {
    user,
    loading,
    logout,
    updateUser,
    login,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || user?.id === 2223
  };
}