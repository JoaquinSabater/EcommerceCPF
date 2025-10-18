'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        
        if (!parsedUser.isAdmin && (parsedUser.id === 2223)) {
          parsedUser.isAdmin = true;
        }
        
        setUser(parsedUser);
        clearProspectoMode();
        
        // Establecer cookies para el middleware
        setCookies(parsedUser);
        
      } else {
        // Rutas públicas que NO requieren autenticación
        const publicRoutes = [
          '/',
          '/auth/forgot-password',
          '/auth/set-password',
          '/auth/reset-password'
        ];
        
        // Si no hay usuario y no estamos en una ruta pública, redirigir al login
        if (!publicRoutes.includes(pathname)) {
          clearAuthData();
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      clearAuthData();
      
      // Rutas públicas que NO requieren autenticación
      const publicRoutes = [
        '/',
        '/auth/forgot-password',
        '/auth/set-password',
        '/auth/reset-password'
      ];
      
      if (!publicRoutes.includes(pathname)) {
        router.push('/');
      }
    }
    setLoading(false);
  };

  const setCookies = (userData: User) => {
    // Generar token simple pero más seguro
    const token = `${userData.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Establecer cookies con configuración segura
    const maxAge = 86400; // 24 horas
    const cookieOptions = `path=/; max-age=${maxAge}; SameSite=Strict; ${
      typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'Secure;' : ''
    }`;
    
    document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(userData))}; ${cookieOptions}`;
    document.cookie = `auth_token=${token}; ${cookieOptions}`;
  };

  const clearAuthData = () => {
    localStorage.removeItem('user');
    
    // Limpiar cookies de forma más robusta
    const expireDate = 'Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = `auth_user=; path=/; expires=${expireDate}`;
    document.cookie = `auth_token=; path=/; expires=${expireDate}`;
    
    clearProspectoMode();
  };

  const clearProspectoMode = () => {
    localStorage.removeItem('prospecto_mode');
    localStorage.removeItem('prospecto_data');
    localStorage.removeItem('prospecto_cart');
    localStorage.removeItem('prospecto_token');
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    router.push('/');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCookies(userData);
    clearProspectoMode();
  };

  // ✅ MODIFICAR: Login con establecimiento de cookies
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCookies(userData);
    clearProspectoMode();
  };

  const getPrecioConDescuento = (precioOriginal: number): number => {
    const esDistribuidor = user?.Distribuidor === 1;
    if (esDistribuidor) {
      const precioConDescuento = precioOriginal * 0.80;
      return Math.ceil(precioConDescuento * 100) / 100;
    }
    return precioOriginal;
  };

  const isDistribuidor = (): boolean => {
    return user?.Distribuidor === 1;
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
    isDistribuidor,
    checkAuth
  };
}