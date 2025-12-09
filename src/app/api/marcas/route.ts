import { NextRequest, NextResponse } from 'next/server';
import { getMarcasConStock } from '@/data/data';
import { getRateLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // 🔒 PROTECCIÓN: Rate limiting (15 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 15, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/marcas');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const subcategoriaId = searchParams.get('subcategoriaId');

    if (!subcategoriaId) {
      return NextResponse.json(
        { success: false, error: 'subcategoriaId es requerido' },
        { status: 400 }
      );
    }

    const marcas = await getMarcasConStock(parseInt(subcategoriaId));
    
    return NextResponse.json({
      success: true,
      marcas
    });
  } catch (error) {
    console.error('Error obteniendo marcas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener marcas' },
      { status: 500 }
    );
  }
}