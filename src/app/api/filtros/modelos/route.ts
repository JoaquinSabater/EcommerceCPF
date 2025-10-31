import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const marcaIds = url.searchParams.get('marcas');

    if (!marcaIds) {
      return NextResponse.json({ 
        success: false,
        message: 'Se requieren IDs de marcas',
        modelos: [] 
      });
    }

    const marcaIdsArray = marcaIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (marcaIdsArray.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'IDs de marcas inválidos',
        modelos: [] 
      });
    }

    const placeholders = marcaIdsArray.map(() => '?').join(',');

    // ✅ OPTIMIZADO: Consulta simple sin cálculos de stock
    const [rows]: any = await db.query(`
      SELECT DISTINCT 
        a.modelo,
        a.marca_id,
        m.nombre as marca_nombre
      FROM articulos a
      INNER JOIN marcas m ON a.marca_id = m.id
      INNER JOIN items i ON a.item_id = i.id
      WHERE i.disponible = 1
      AND a.marca_id IN (${placeholders})
      ORDER BY m.nombre, a.modelo ASC
    `, marcaIdsArray);

    return NextResponse.json({ 
      success: true,
      modelos: rows 
    });

  } catch (error) {
    console.error('Error al obtener modelos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener modelos' },
      { status: 500 }
    );
  }
}