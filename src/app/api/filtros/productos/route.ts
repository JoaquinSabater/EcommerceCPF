import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const marcaIds = url.searchParams.get('marcas');
    const modelos = url.searchParams.get('modelos');

    if (!marcaIds) {
      return NextResponse.json({ 
        success: false,
        message: 'Se requieren IDs de marcas',
        productos: [] 
      });
    }

    const marcaIdsArray = marcaIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (marcaIdsArray.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'IDs de marcas inválidos',
        productos: [] 
      });
    }

    let sqlQuery = `
      SELECT DISTINCT
        a.codigo_interno,
        i.id as item_id,
        i.nombre AS item,
        a.modelo,
        m.nombre AS marca_nombre,
        a.precio_venta,
        calcular_stock_fisico(a.codigo_interno) - calcular_stock_comprometido(a.codigo_interno) AS stock_real,
        a.ubicacion,
        d.foto1_url,
        d.foto_portada,
        d.descripcion,
        CONCAT(m.nombre, ' ', a.modelo) AS marca_modelo_completo
      FROM articulos a
      INNER JOIN items i ON a.item_id = i.id
      INNER JOIN marcas m ON a.marca_id = m.id
      LEFT JOIN item_detalle d ON a.item_id = d.item_id
      WHERE i.disponible = 1
      AND a.marca_id IN (${marcaIdsArray.map(() => '?').join(',')})
    `;

    let parametros: (string | number)[] = [...marcaIdsArray];

    // Si hay modelos específicos seleccionados
    if (modelos && modelos.trim().length > 0) {
      const modelosArray = modelos.split(',').map(m => m.trim()).filter(m => m.length > 0);
      if (modelosArray.length > 0) {
        sqlQuery += ` AND a.modelo IN (${modelosArray.map(() => '?').join(',')})`;
        parametros.push(...modelosArray);
      }
    }

    sqlQuery += `
      HAVING stock_real > 0
      ORDER BY m.nombre, a.modelo, i.nombre
      LIMIT 100
    `;

    const [rows]: any = await db.query(sqlQuery, parametros);

    return NextResponse.json({ 
      success: true,
      productos: rows,
      total: rows.length,
      filtros: {
        marcas: marcaIdsArray,
        modelos: modelos ? modelos.split(',') : []
      }
    });

  } catch (error) {
    console.error('Error al obtener productos filtrados:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}