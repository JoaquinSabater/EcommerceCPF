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
        
        // ✅ Logging para debugging
        console.log('🔍 Usuario cargado desde localStorage:', {
          id: parsedUser.id,
          nombre: parsedUser.nombre,
          Distribuidor: parsedUser.Distribuidor,
          isDistribuidor: parsedUser.Distribuidor === 1
        });
        
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
    // ✅ Logging para debugging
    console.log('🔄 Actualizando usuario:', {
      id: userData.id,
      nombre: userData.nombre,
      Distribuidor: userData.Distribuidor,
      isDistribuidor: userData.Distribuidor === 1
    });
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    clearProspectoMode();
  };

  const login = (userData: User) => {
    // ✅ Logging para debugging
    console.log('✅ Usuario autenticando:', {
      id: userData.id,
      nombre: userData.nombre,
      Distribuidor: userData.Distribuidor,
      isDistribuidor: userData.Distribuidor === 1
    });
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    clearProspectoMode();
    
    console.log('✅ Usuario autenticado, modo prospecto limpiado');
  };

  // ✅ FUNCIÓN MEJORADA: Calcular precio con descuento distribuidor
  const getPrecioConDescuento = (precioOriginal: number): number => {
    const esDistribuidor = user?.Distribuidor === 1;
    const resultado = esDistribuidor ? precioOriginal * 0.80 : precioOriginal;
    
    // ✅ Logging detallado para debugging
    console.log('💰 Calculando precio:', {
      precioOriginal,
      userId: user?.id,
      Distribuidor: user?.Distribuidor,
      esDistribuidor,
      precioConDescuento: resultado
    });
    
    return resultado;
  };

  // ✅ FUNCIÓN MEJORADA: Verificar si el usuario es distribuidor
  const isDistribuidor = (): boolean => {
    const resultado = user?.Distribuidor === 1;
    
    // ✅ Logging detallado para debugging
    console.log('🏢 Verificando distribuidor:', {
      userId: user?.id,
      nombre: user?.nombre,
      Distribuidor: user?.Distribuidor,
      resultado
    });
    
    return resultado;
  };

  return {
    user,
    loading,
    logout,
    updateUser,
    login,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || user?.id === 2223,
    getPrecioConDescuento,
    isDistribuidor
  };
}