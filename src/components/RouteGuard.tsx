'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // Rutas que NO necesitan autenticación
  const publicRoutes = [
    '/',                          // Login
    '/auth/forgot-password',      // Recuperar contraseña
    '/auth/set-password',         // Configurar contraseña
    '/auth/reset-password'        // Reset contraseña
  ];
  
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Si es ruta pública, mostrar contenido directamente
  if (isPublicRoute) {
    return <>{children}</>;
  }
  
  // Para rutas protegidas, verificar autenticación
  
  // Mostrar loading mientras se verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }
  
  // Si no hay usuario autenticado, no mostrar contenido (middleware redirigirá)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}