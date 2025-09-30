import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        success: false,
        message: 'Debe proporcionar un término de búsqueda',
        results: [] 
      });
    }

    const palabrasClave = query.trim().split(' ').filter(palabra => palabra.trim() !== '');
    
    if (palabrasClave.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Término de búsqueda inválido',
        results: []
      });
    }

    const condiciones: string[] = [];
    const parametros: string[] = [];

    palabrasClave.forEach(palabra => {
      condiciones.push(`(
        a.codigo_interno LIKE ? OR 
        i.nombre LIKE ? OR 
        m.nombre LIKE ? OR 
        a.modelo LIKE ?
      )`);
      parametros.push(`%${palabra}%`, `%${palabra}%`, `%${palabra}%`, `%${palabra}%`);
    });

    const whereClause = condiciones.join(' AND ');

    const sqlMain = `
      SELECT 
        a.codigo_interno,
        CONCAT(
          IFNULL(i.nombre, ''), ' ', 
          IFNULL(m.nombre, ''), ' ', 
          IFNULL(a.modelo, '')
        ) AS descripcion,
        i.id as item_id,
        i.nombre AS item,
        a.modelo,
        m.nombre AS marca_nombre,
        a.precio_venta,
        calcular_stock_fisico(a.codigo_interno) - calcular_stock_comprometido(a.codigo_interno) AS stock_real,
        a.ubicacion,
        d.foto1_url,
        d.foto_portada,
        CONCAT(m.nombre, ' ', a.modelo) AS marca_modelo_completo
      FROM articulos a
      INNER JOIN items i ON a.item_id = i.id
      INNER JOIN marcas m ON a.marca_id = m.id
      LEFT JOIN item_detalle d ON a.item_id = d.item_id
      WHERE ${whereClause}
      HAVING stock_real > 0
      ORDER BY i.nombre, m.nombre, a.modelo
    `;

    const [rows]: any = await db.query(sqlMain, parametros);

    console.log(`Búsqueda: "${query}" - ${rows.length} resultados encontrados`);
    console.log(`Palabras clave: [${palabrasClave.join(', ')}]`);

    return NextResponse.json({ 
      success: true,
      results: rows,
      query: query,
      total: rows.length
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor', 
        message: 'Error al buscar artículos',
        results: [] 
      },
      { status: 500 }
    );
  }
}