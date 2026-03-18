import { NextRequest, NextResponse } from 'next/server';
import { getCategorias } from '@/data/data';
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
      SELECT DISTINCT i.subcategoria_id
      FROM item_detalle id_table
      JOIN items i ON id_table.item_id = i.id
      WHERE id_table.${campoCategoria} = 1
    `;

    const [rows]: any = await db.query(query);
    
    if (rows.length === 0) {
      return NextResponse.json([]);
    }

    let productosCategoria = [];
    
    for (const row of rows) {
      const categorias = await getCategorias(row.subcategoria_id);
      
      const categoriasFiltradas = await Promise.all(
        categorias.map(async (cat) => {
          const [catRows]: any = await db.query(
            `SELECT ${campoCategoria} as tiene_categoria FROM item_detalle WHERE item_id = ?`,
            [cat.id]
          );
          
          return catRows.length > 0 && catRows[0].tiene_categoria === 1 ? cat : null;
        })
      );
      
      productosCategoria.push(...categoriasFiltradas.filter(Boolean));
    }
    
    return NextResponse.json(productosCategoria);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos por categoría' },
      { status: 500 }
    );
  }
}
