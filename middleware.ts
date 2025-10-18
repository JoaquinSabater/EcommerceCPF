import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas que NO requieren autenticación
  const publicPaths = [
    '/api',
    '/_next',
    '/favicon.ico',
    '/static',
    '/images',
    // ✅ AGREGAR: Rutas de autenticación
    '/auth/forgot-password',
    '/auth/set-password',
    '/auth/reset-password'
  ];
  
  // Si es una ruta pública, permitir acceso
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Verificar autenticación en cookies
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