import { NextResponse, NextRequest } from 'next/server';
import { getDolar } from '@/data/data';
import { getRateLimiter } from '@/lib/rate-limit';

// ✅ OPTIMIZADO: Cache ISR de 1 hora (el dólar cambia poco)
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  // 🔒 PROTECCIÓN: Rate limiting (20 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 20, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/dolar');
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Intenta nuevamente en unos segundos.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  const valor = await getDolar();
  return NextResponse.json({ dolar: valor });
}
