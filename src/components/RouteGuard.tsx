'use client';

import { useAuth } from '@/hooks/useAuth';
import { useProspectoMode } from '@/hooks/useProspectoMode';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const { isProspectoMode, isChatbotMode, prospectoData, isValidatingToken } = useProspectoMode(); // ✅ AGREGADO isChatbotMode
  const pathname = usePathname();
  const router = useRouter();
  
  const publicRoutes = useMemo(() => [
    '/',
    '/auth/forgot-password',
    '/auth/set-password', 
    '/auth/reset-password',
    '/prospecto-order',
    '/stock-ambulante'
  ], []);
  
  const isPublicRoute = useMemo(() => 
    publicRoutes.includes(pathname), 
    [publicRoutes, pathname]
  );
  
  // ✅ MODIFICADO: Incluir isChatbotMode en acceso válido
  const hasValidAccess = useMemo(() => 
    user || (isProspectoMode && prospectoData) || (isChatbotMode && prospectoData), 
    [user, isProspectoMode, isChatbotMode, prospectoData]
  );
  
  const isLoading = useMemo(() => 
    loading || isValidatingToken, 
    [loading, isValidatingToken]
  );
  
  useEffect(() => {
    if (isLoading || isPublicRoute) {
      return;
    }
    
    if (!hasValidAccess) {
      console.log('❌ Sin acceso válido, redirigiendo al login');
      router.push('/');
    }
  }, [isLoading, isPublicRoute, hasValidAccess, router]);
  
  
  if (isPublicRoute) {
    return <>{children}</>;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-gray-600">
            {isValidatingToken ? 'Validando acceso...' : 'Verificando acceso...'}
          </p>
        </div>
      </div>
    );
  }
  
  if (!hasValidAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {children}
    </>
  );
}