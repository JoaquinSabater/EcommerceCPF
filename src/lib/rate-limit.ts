// Rate limiter simple en memoria para VPS
// No requiere Redis - funciona con Map de Node.js

interface RateLimitEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.limits = new Map();
    
    // Limpiar entradas viejas cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.limits.entries()) {
        if (entry.resetAt < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
          this.limits.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Verifica si una IP puede hacer una request
   * @param identifier - IP o identificador único
   * @param maxRequests - Número máximo de requests
   * @param windowMs - Ventana de tiempo en milisegundos
   * @param blockDurationMs - Tiempo de bloqueo si excede (opcional)
   */
  check(
    identifier: string, 
    maxRequests: number, 
    windowMs: number,
    blockDurationMs?: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    // Si está bloqueado
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockedUntil
      };
    }

    // Si no existe o la ventana expiró, crear nueva
    if (!entry || entry.resetAt < now) {
      this.limits.set(identifier, {
        count: 1,
        resetAt: now + windowMs
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: now + windowMs
      };
    }

    // Incrementar contador
    entry.count++;

    // Si excede el límite
    if (entry.count > maxRequests) {
      if (blockDurationMs) {
        entry.blockedUntil = now + blockDurationMs;
      }
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt
    };
  }

  /**
   * Resetea el límite para un identificador
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Obtiene estadísticas actuales
   */
  getStats() {
    return {
      totalTracked: this.limits.size,
      entries: Array.from(this.limits.entries()).map(([key, value]) => ({
        identifier: key.substring(0, 15) + '...', // Ocultar IPs completas
        count: value.count,
        resetAt: new Date(value.resetAt).toISOString(),
        blocked: value.blockedUntil ? value.blockedUntil > Date.now() : false
      }))
    };
  }

  cleanup() {
    clearInterval(this.cleanupInterval);
    this.limits.clear();
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

// Configuraciones predefinidas para diferentes endpoints
export const RateLimitConfigs = {
  // Login: 5 intentos cada 15 minutos, bloqueo de 1 hora si excede
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDurationMs: 60 * 60 * 1000, // 1 hora
    message: 'Demasiados intentos de login. Tu IP ha sido bloqueada por 1 hora.'
  },
  
  // Búsqueda: 30 búsquedas por minuto
  search: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 5 * 60 * 1000, // 5 minutos de bloqueo
    message: 'Demasiadas búsquedas. Espera 5 minutos.'
  },
  
  // APIs generales: 100 requests por minuto
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 10 * 60 * 1000, // 10 minutos
    message: 'Límite de requests excedido. Espera 10 minutos.'
  },
  
  // Upload de imágenes: 10 por hora
  upload: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas
    message: 'Límite de uploads excedido. Espera 2 horas.'
  }
};
