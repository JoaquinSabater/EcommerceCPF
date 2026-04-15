import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export const dynamic = 'force-dynamic';

interface ProductoDestacadoRow {
  id: number;
  nombre: string;
  foto_portada: string | null;
  foto1_url: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const excludeItemId = Number(searchParams.get('excludeItemId'));
    const limitParam = Number(searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 24) : 12;

    const hasExclude = Number.isFinite(excludeItemId) && excludeItemId > 0;

    const query = `SELECT
        i.id,
        i.nombre,
        id.foto_portada,
        id.foto1_url
      FROM items i
      INNER JOIN item_detalle id ON i.id = id.item_id
      WHERE i.disponible = 1
        AND id.destacar = 1
        AND (? IS NULL OR i.id <> ?)
        AND EXISTS (
          SELECT 1
          FROM articulos a
          WHERE a.item_id = i.id
            AND a.ubicacion <> 'SIN STOCK'
            AND (calcular_stock_fisico(a.codigo_interno) - calcular_stock_comprometido(a.codigo_interno)) > 0
        )
      ORDER BY i.nombre ASC
      LIMIT ?`;

    const excludeValue = hasExclude ? excludeItemId : null;
    const params = [excludeValue, excludeValue, limit];
    const [rows] = await db.query(query, params);

    return NextResponse.json(rows as ProductoDestacadoRow[]);
  } catch (error) {
    console.error('Error al obtener items destacados:', error);
    return NextResponse.json(
      { error: 'Error al obtener items destacados' },
      { status: 500 }
    );
  }
}
