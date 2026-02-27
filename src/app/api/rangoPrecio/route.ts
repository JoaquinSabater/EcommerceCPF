import { NextRequest, NextResponse } from "next/server";
import { db } from "@/data/mysql";
import { getRateLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // 🔒 PROTECCIÓN: Rate limiting (20 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 20, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/rangoPrecio');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  const { searchParams } = new URL(request.url);
  const itemId = Number(searchParams.get("itemId"));

  if (!itemId) {
    return NextResponse.json({ error: "itemId requerido" }, { status: 400 });
  }

  try {
    // ✅ OPTIMIZADO: Calcular MIN/MAX directamente en SQL en vez de
    // traer TODOS los artículos y calcular en JS.
    // Usa stock_actual > 0 como filtro rápido en vez de stored functions.
    const [rows]: any = await db.query(
      `SELECT 
        MIN(CASE WHEN a.precio_venta > 0 THEN a.precio_venta ELSE NULL END) AS precioMinimo,
        MAX(CASE WHEN a.precio_venta > 0 THEN a.precio_venta ELSE NULL END) AS precioMaximo,
        COUNT(DISTINCT a.codigo_interno) AS totalArticulos,
        COUNT(DISTINCT CASE WHEN a.precio_venta > 0 THEN a.codigo_interno ELSE NULL END) AS articulosConPrecio
      FROM articulos a
      WHERE a.item_id = ? 
        AND a.ubicacion <> 'SIN STOCK'
        AND a.stock_actual > 0`,
      [itemId]
    );

    const resultado = rows[0];
    const precioMinimo = resultado.precioMinimo ? Number(resultado.precioMinimo) : null;
    const precioMaximo = resultado.precioMaximo ? Number(resultado.precioMaximo) : null;
    const tieneVariacion = precioMinimo !== null && precioMaximo !== null && precioMinimo !== precioMaximo;

    return NextResponse.json({ 
      precioMinimo,
      precioMaximo,
      tieneVariacion,
      totalArticulos: Number(resultado.totalArticulos) || 0,
      articulosConPrecio: Number(resultado.articulosConPrecio) || 0
    });

  } catch (error) {
    console.error('Error obteniendo rango de precios:', error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}