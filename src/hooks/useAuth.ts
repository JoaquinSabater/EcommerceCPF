'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/types'; // Importar el tipo desde types.ts

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // ✅ LIMPIAR MODO PROSPECTO SI HAY USUARIO AUTENTICADO
        clearProspectoMode();
        
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // ✅ NUEVA FUNCIÓN PARA LIMPIAR MODO PROSPECTO
  const clearProspectoMode = () => {
    localStorage.removeItem('prospecto_mode');
    localStorage.removeItem('prospecto_data');
    localStorage.removeItem('prospecto_cart');
    localStorage.removeItem('prospecto_token');
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth/login';
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // ✅ LIMPIAR MODO PROSPECTO AL ACTUALIZAR USUARIO
    clearProspectoMode();
  };

  // ✅ NUEVA FUNCIÓN PARA LOGIN (si no la tienes en otro lado)
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // ✅ LIMPIAR MODO PROSPECTO AL HACER LOGIN
    clearProspectoMode();
    
    console.log('✅ Usuario autenticado, modo prospecto limpiado');
  };

  return {
    user,
    loading,
    logout,
    updateUser,
    login, // ✅ AGREGAR FUNCIÓN LOGIN
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };
}