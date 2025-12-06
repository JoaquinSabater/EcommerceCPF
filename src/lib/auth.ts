import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key';

export interface AuthUser {
  id: number;
  cuil: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  vendedor_id?: number;
  Distribuidor?: number;
  isAdmin?: boolean;
  contenidoEspecial?: number;
}

export interface VerifyResult {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Verifica el token JWT de autenticación desde las cookies
 * @param request NextRequest de la API
 * @returns VerifyResult con estado de autenticación y datos del usuario
 */
export function verifyAuth(request: NextRequest): VerifyResult {
  try {
    // Obtener token de cookies
    const token = request.cookies.get('auth_token')?.value;
    const userCookie = request.cookies.get('auth_user')?.value;

    if (!token || !userCookie) {
      return {
        authenticated: false,
        error: 'No autenticado - Token o usuario faltante'
      };
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Validar que los datos coincidan
    const userData = JSON.parse(userCookie);
    
    if (decoded.id !== userData.id || decoded.cuil !== userData.cuil) {
      return {
        authenticated: false,
        error: 'Token no válido - Datos inconsistentes'
      };
    }

    return {
      authenticated: true,
      user: decoded
    };

  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : 'Error de autenticación'
    };
  }
}

/**
 * Verifica si el usuario es administrador
 */
export function isAdmin(user: AuthUser): boolean {
  return user.isAdmin === true || (user.isAdmin as any) === 1;
}

/**
 * Verifica si el usuario es distribuidor
 */
export function isDistribuidor(user: AuthUser): boolean {
  return user.Distribuidor === 1;
}

/**
 * Middleware helper para proteger rutas de API
 * Retorna una respuesta de error si no está autenticado
 */
export function requireAuth(request: NextRequest): { user: AuthUser } | Response {
  const { authenticated, user, error } = verifyAuth(request);

  if (!authenticated || !user) {
    console.warn('🚨 INTENTO DE ACCESO NO AUTORIZADO:', {
      url: request.url,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent')
    });

    return new Response(
      JSON.stringify({ 
        error: 'No autenticado',
        message: error || 'Debe iniciar sesión para acceder a este recurso'
      }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return { user };
}

/**
 * Middleware helper para proteger rutas de admin
 */
export function requireAdmin(request: NextRequest): { user: AuthUser } | Response {
  const authResult = requireAuth(request);
  
  // Si ya es un Response (error), retornarlo
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;

  if (!isAdmin(user)) {
    console.error('🚨 INTENTO DE ACCESO ADMIN SIN PERMISOS:', {
      userId: user.id,
      userName: `${user.nombre} ${user.apellido}`,
      url: request.url,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return new Response(
      JSON.stringify({ 
        error: 'Acceso denegado',
        message: 'Se requieren permisos de administrador'
      }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return { user };
}

/**
 * Sanitiza inputs para prevenir SQL injection
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/['"`;\\]/g, '') // Remover caracteres peligrosos
    .trim()
    .substring(0, 1000); // Limitar longitud
}

/**
 * Valida que un ID sea un número válido
 */
export function validateId(id: any): number | null {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return null;
  }
  return numId;
}
