import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { getRateLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // 🔒 PROTECCIÓN: Rate limiting (15 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 15, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/filtros/marcas');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  try {
    // ✅ OPTIMIZADO: Consulta simple sin cálculos de stock
    const [rows]: any = await db.query(`
      SELECT DISTINCT 
        m.id,
        m.nombre
      FROM marcas m
      INNER JOIN articulos a ON m.id = a.marca_id
      INNER JOIN items i ON a.item_id = i.id
      WHERE i.disponible = 1
      ORDER BY m.nombre ASC
    `);

    return NextResponse.json({ 
      success: true,
      marcas: rows 
    });

  } catch (error) {
    console.error('Error al obtener marcas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener marcas' },
      { status: 500 }
    );
  }
}