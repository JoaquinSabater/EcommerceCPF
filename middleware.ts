import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 🔓 APIs de autenticación (se llaman ANTES de tener cookies)
  // IMPORTANTE: Estas deben tener rate limiting implementado en la API
  const authAPIs = [
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password', 
    '/api/auth/set-password',
  ];
  
  // 🔐 APIs QUE REQUIEREN TOKEN DE PROSPECTO VÁLIDO
  const prospectoAPIs = [
    '/api/prospectos/validate-token',
  ];

  // 🛡️ TODAS LAS DEMÁS APIs REQUIEREN AUTENTICACIÓN
  // Esto incluye:
  // - /api/pedidos-preliminares (requiere auth de usuario)
  // - /api/actualizar (requiere admin)
  // - /api/upload-image (requiere admin)
  // - /api/recomendaciones POST (requiere admin)
  // - /api/admin/* (requiere admin)
  // - /api/prospecto-to-cliente (requiere admin)
  // - /api/chat (BLOQUEADA)
  
  // Rutas estáticas permitidas
  const staticPaths = [
    '/_next',
    '/favicon.ico',
    '/static',
    '/images',
    '/auth/forgot-password',
    '/auth/set-password',
    '/auth/reset-password'
  ];
  
  // Permitir rutas estáticas
  if (staticPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 🔒 Verificar si es una API
  if (pathname.startsWith('/api/')) {
    // 🔓 Permitir APIs de autenticación (se ejecutan ANTES de login)
    const isAuthAPI = authAPIs.some(path => pathname.startsWith(path));
    if (isAuthAPI) {
      // ⚠️ Rate limiting debería estar implementado en estas APIs
      return NextResponse.next();
    }

    // 🔐 Verificar autenticación de USUARIO
    const userCookie = request.cookies.get('auth_user');
    const tokenCookie = request.cookies.get('auth_token');
    const hasUserAuth = userCookie && tokenCookie;

    // 🔐 Verificar token de PROSPECTO (solo para APIs específicas)
    const isProspectoAPI = prospectoAPIs.some(path => pathname.startsWith(path));
    const prospectoToken = request.cookies.get('prospecto_token');
    const hasProspectoAuth = isProspectoAPI && prospectoToken;

    // ✅ Permitir si tiene autenticación válida
    if (hasUserAuth || hasProspectoAuth) {
      return NextResponse.next();
    }

    // 🚨 NO AUTENTICADO - BLOQUEAR ACCESO
    console.warn('🚨 INTENTO DE ACCESO NO AUTORIZADO A API:', {
      path: pathname,
      method: request.method,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json(
      { 
        error: 'No autorizado',
        message: 'Se requiere autenticación para acceder a este recurso'
      },
      { status: 401 }
    );
  }
  
  // Verificar autenticación para rutas de página
  const userCookie = request.cookies.get('auth_user');
  const tokenCookie = request.cookies.get('auth_token');
  
  // Si hay autenticación válida, permitir acceso
  if (userCookie && tokenCookie) {
    return NextResponse.next();
  }
  
  // Si no hay autenticación y NO está en la raíz, redirigir a la raíz (login)
  if (pathname !== '/') {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si está en la raíz sin autenticación, permitir (para mostrar login)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};