import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query.trim()}%`;

    const [rows]: any = await db.query(
      `SELECT 
         i.id as item_id,
         i.nombre AS item,
         a.codigo_interno,
         a.modelo,
         m.nombre AS marca_nombre,
         a.precio_venta,
         calcular_stock_fisico(a.codigo_interno) - calcular_stock_comprometido(a.codigo_interno) AS stock_real,
         d.foto1_url,
         d.foto_portada,
         CONCAT(m.nombre, ' ', a.modelo) AS marca_modelo_completo
       FROM articulos a
       JOIN items i ON a.item_id = i.id
       LEFT JOIN marcas m ON a.marca_id = m.id
       LEFT JOIN item_detalle d ON a.item_id = d.item_id
       WHERE (
         a.modelo LIKE ? OR 
         m.nombre LIKE ? OR 
         CONCAT(m.nombre, ' ', a.modelo) LIKE ? OR
         i.nombre LIKE ?
       )
       HAVING stock_real > 0
       ORDER BY i.nombre, m.nombre, a.modelo`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    console.log(`Búsqueda: "${query}" - ${rows.length} resultados encontrados`);

    return NextResponse.json({ 
      results: rows,
      query: query 
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', results: [] },
      { status: 500 }
    );
  }
}