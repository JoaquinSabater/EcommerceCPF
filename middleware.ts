import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 🛡️ PROTECCIÓN ANTI-BOT: Bloquear user-agents sospechosos
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousAgents = [
    'python-requests',
    'curl/',
    'wget/',
    'scrapy',
    'bot',
    'crawler',
    'spider',
    'nikto',
    'sqlmap',
    'nmap'
  ];
  
  const isSuspicious = suspiciousAgents.some(agent => 
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );
  
  // Permitir curl/wget solo en desarrollo
  const isDev = process.env.NODE_ENV === 'development';
  if (isSuspicious && !isDev && pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    console.error(`🚨 BOT BLOQUEADO - IP: ${ip} - User-Agent: ${userAgent} - Path: ${pathname}`);
    
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  

  const authAPIs = [
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password', 
    '/api/auth/set-password',
    '/api/detalle',
  ];
  
  const prospectoAPIs = [
    '/api/prospectos/validate-token',
  ];

  const staticPaths = [
    '/_next',
    '/favicon.ico',
    '/static',
    '/images',
    '/auth/forgot-password',
    '/auth/set-password',
    '/auth/reset-password',
    '/stock-ambulante'  // Permitir acceso sin autenticación (usa su propio sistema de tokens)
  ];
  
  // Debug log para stock-ambulante
  if (pathname.includes('stock-ambulante')) {
    console.log('🔍 Acceso a stock-ambulante:', {
      pathname,
      matchesStaticPath: staticPaths.some(path => pathname.startsWith(path))
    });
  }
  
  if (staticPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    const isAuthAPI = authAPIs.some(path => pathname.startsWith(path));
    if (isAuthAPI) {
      return NextResponse.next();
    }

    const userCookie = request.cookies.get('auth_user');
    const tokenCookie = request.cookies.get('auth_token');
    const hasUserAuth = userCookie && tokenCookie;

    const isProspectoAPI = prospectoAPIs.some(path => pathname.startsWith(path));
    const prospectoToken = request.cookies.get('prospecto_token');
    const hasProspectoAuth = isProspectoAPI && prospectoToken;

    if (hasUserAuth || hasProspectoAuth) {
      const response = NextResponse.next();
      
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      return response;
    }

    console.warn('🚨 INTENTO DE ACCESO NO AUTORIZADO A API:', {
      path: pathname,
      method: request.method,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json(
      { 
        error: 'Not Found',
        message: 'La ruta solicitada no existe'
      },
      { status: 404 }
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
     * ✅ OPTIMIZADO: Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, *.png, *.jpg, *.jpeg, *.svg, *.webp (imágenes)
     * - *.woff, *.woff2, *.ttf (fuentes)
     * - *.css, *.js (assets compilados)
     * 
     * Esto reduce latencia en cada request y ahorra Edge Requests
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.woff|.*\\.woff2|.*\\.ttf|.*\\.ico).*)',
  ],
};