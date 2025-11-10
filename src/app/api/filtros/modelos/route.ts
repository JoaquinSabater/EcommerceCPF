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

    // ✅ AGREGAR FILTRO: Excluir subcategorías de "Otros"
    const subcategoriasOtros = [18, 19, 20, 21, 24]; // ✅ Mismas que en /public/otros/page.tsx
    const placeholdersOtros = subcategoriasOtros.map(() => '?').join(',');

    // ✅ CONSULTA MODIFICADA: Excluir modelos de subcategorías "Otros"
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
      AND i.subcategoria_id NOT IN (${placeholdersOtros})
      ORDER BY m.nombre, a.modelo ASC
    `, [...marcaIdsArray, ...subcategoriasOtros]);

    console.log(`🔍 Filtros Modelos - Marcas: [${marcaIdsArray.join(', ')}]`);
    console.log(`🔒 Subcategorías excluidas (Otros): [${subcategoriasOtros.join(', ')}]`);
    console.log(`✅ Modelos encontrados: ${rows.length}`);

    return NextResponse.json({ 
      success: true,
      modelos: rows,
      debug: {
        marcasConsultadas: marcaIdsArray,
        subcategoriasExcluidas: subcategoriasOtros,
        totalModelos: rows.length
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener modelos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener modelos' },
      { status: 500 }
    );
  }
}