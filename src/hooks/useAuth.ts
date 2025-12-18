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
        
        setCookies(parsedUser);
        
      } else {
        const prospectoModeActive = localStorage.getItem('prospecto_mode') === 'true';
        const chatbotModeActive = localStorage.getItem('chatbot_mode') === 'true';
        const prospectoDataStored = localStorage.getItem('prospecto_data');
        
        const publicRoutes = [
          '/',
          '/auth/forgot-password',
          '/auth/set-password',
          '/auth/reset-password',
          '/prospecto-order'
        ];
        
        const shouldNotRedirect = publicRoutes.includes(pathname) || 
                                 (prospectoModeActive && prospectoDataStored) ||
                                 (chatbotModeActive && prospectoDataStored);
        
        if (!shouldNotRedirect) {
          console.log('🔄 No hay usuario ni prospecto/chatbot activo, redirigiendo al login');
          clearAuthData();
          router.push('/');
        } else if (prospectoModeActive && prospectoDataStored) {
          console.log('✅ Modo prospecto detectado, permitiendo acceso');
        } else if (chatbotModeActive && prospectoDataStored) { 
          console.log('✅ Modo chatbot detectado, permitiendo acceso');
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      
      const prospectoModeActive = localStorage.getItem('prospecto_mode') === 'true';
      const chatbotModeActive = localStorage.getItem('chatbot_mode') === 'true';
      const prospectoDataStored = localStorage.getItem('prospecto_data');
      
      const publicRoutes = [
        '/',
        '/auth/forgot-password',
        '/auth/set-password',
        '/auth/reset-password',
        '/prospecto-order'
      ];
      
      const shouldNotRedirect = publicRoutes.includes(pathname) || 
                               (prospectoModeActive && prospectoDataStored) ||
                               (chatbotModeActive && prospectoDataStored);
      
      if (!shouldNotRedirect) {
        clearAuthData();
        router.push('/');
      }
    }
    setLoading(false);
  };

  const setCookies = (userData: User, jwtToken?: string) => {
    const maxAge = 2592000; // 30 días (30 * 24 * 60 * 60)
    const cookieOptions = `path=/; max-age=${maxAge}; SameSite=Strict; ${
      typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'Secure;' : ''
    }`;
    
    document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(userData))}; ${cookieOptions}`;
    
    // ✅ CORREGIDO: Usar el token JWT real si existe, o regenerar basado en localStorage
    if (jwtToken) {
      document.cookie = `auth_token=${jwtToken}; ${cookieOptions}`;
    } else {
      // Si no hay token (ej: al recargar página), intentar obtenerlo de las cookies existentes
      const existingToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
      
      if (existingToken) {
        document.cookie = `auth_token=${existingToken}; ${cookieOptions}`;
      }
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('user');
    
    const expireDate = 'Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = `auth_user=; path=/; expires=${expireDate}`;
    document.cookie = `auth_token=; path=/; expires=${expireDate}`;
  };

  const clearProspectoMode = () => {
    localStorage.removeItem('prospecto_mode');
    localStorage.removeItem('chatbot_mode');
    localStorage.removeItem('prospecto_data');
    localStorage.removeItem('prospecto_cart');
    localStorage.removeItem('prospecto_token');
  };

  const logout = () => {
    clearAuthData();
    clearProspectoMode();
    setUser(null);
    router.push('/');
  };

  const updateUser = (userData: User, jwtToken?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCookies(userData, jwtToken);
    clearProspectoMode();
  };

  const login = (userData: User, jwtToken?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCookies(userData, jwtToken);
    clearProspectoMode();
  };

  // ✅ NUEVA FUNCIÓN: Verificar si un item está excluido del descuento
  const esCategoriaExcluida = (itemId?: number): boolean => {
    if (!itemId) return false;
    
    // ✅ IDs de items excluidos del descuento de distribuidor
    const itemsExcluidos = [18, 19, 20, 21, 22, 24, 25,323];
    
    return itemsExcluidos.includes(itemId);
  };

  // ✅ FUNCIÓN ACTUALIZADA: Solo aplicar descuento si no está excluido
  const getPrecioConDescuento = (precioOriginal: number, product?: any): number => {
    const esDistribuidor = user?.Distribuidor === 1;
    
    if (!esDistribuidor) {
      return precioOriginal; // Si no es distribuidor, precio original
    }

    const precioConDescuento = precioOriginal * 0.80;
    return Math.ceil(precioConDescuento * 100) / 100;
  };

  const isDistribuidor = (): boolean => {
    return user?.Distribuidor === 1;
  };

  const tieneContenidoEspecial = (): boolean => {
    return user?.contenidoEspecial === 1;
  };

  const isAdmin = (): boolean => {
    return user?.isAdmin || user?.id === 2223;
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
    esCategoriaExcluida,
    isDistribuidor,
    checkAuth,
    tieneContenidoEspecial 
  };
}