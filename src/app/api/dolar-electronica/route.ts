import { NextRequest, NextResponse } from "next/server";
import { getDolarElectronica } from "@/data/data";
import { getRateLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // 🔒 PROTECCIÓN: Rate limiting (20 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 20, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/dolar-electronica');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  try {
    const dolarElectronica = await getDolarElectronica();
    return NextResponse.json({ dolar: dolarElectronica });
  } catch (error) {
    console.error('Error obteniendo dólar electrónica:', error);
    return NextResponse.json({ dolar: 1 }, { status: 500 });
  }
}