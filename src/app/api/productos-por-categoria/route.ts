import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { getRateLimiter } from '@/lib/rate-limit';

// ✅ OPTIMIZADO: Cache ISR de 30 minutos
export const revalidate = 1800;

const CATEGORIA_FIELDS: Record<string, string> = {
  'best-sellers': 'categoria_best_sellers',
  'magsafe': 'categoria_magsafe',
  'ofertas': 'categoria_ofertas',
  'iphone': 'categoria_iphone',
  'nuevos-ingresos': 'categoria_nuevos_ingresos',
};

export async function GET(request: NextRequest) {
  // 🔒 PROTECCIÓN: Rate limiting (10 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 10, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/productos-por-categoria');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');

    if (!categoria || !CATEGORIA_FIELDS[categoria]) {
      return NextResponse.json(
        { error: 'Categoría no válida' },
        { status: 400 }
      );
    }

    const campoCategoria = CATEGORIA_FIELDS[categoria];

    const query = `
      SELECT
        i.*,
        COUNT(DISTINCT a.codigo_interno) AS modelosDisponibles,
        id_table.foto_portada,
        id_table.foto1_url,
        id_table.foto2_url,
        id_table.foto3_url,
        id_table.foto4_url,
        id_table.descripcion,
        MIN(CASE WHEN a.precio_venta > 0 THEN a.precio_venta ELSE NULL END) AS precioMinimo,
        MAX(CASE WHEN a.precio_venta > 0 THEN a.precio_venta ELSE NULL END) AS precioMaximo
      FROM items i
      INNER JOIN articulos a ON i.id = a.item_id
      INNER JOIN item_detalle id_table ON i.id = id_table.item_id
      WHERE id_table.${campoCategoria} = 1
        AND i.disponible = 1
        AND COALESCE(id_table.contenido_especial, 0) = 0
        AND (calcular_stock_fisico(a.codigo_interno) - calcular_stock_comprometido(a.codigo_interno)) > 0
      GROUP BY
        i.id, i.nombre, i.subcategoria_id, i.disponible,
        id_table.foto_portada, id_table.foto1_url, id_table.foto2_url, id_table.foto3_url, id_table.foto4_url,
        id_table.descripcion
      ORDER BY modelosDisponibles DESC, i.nombre ASC
    `;

    const [rows]: any = await db.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos por categoría' },
      { status: 500 }
    );
  }
}
