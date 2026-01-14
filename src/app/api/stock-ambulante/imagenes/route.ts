import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'item_id requerido' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    try {
      // Obtener todas las imágenes del item_detalle
      const [detalle]: any = await connection.execute(
        `SELECT 
          foto_portada,
          foto1_url,
          foto2_url,
          foto3_url,
          foto4_url
        FROM item_detalle
        WHERE item_id = ?
        LIMIT 1`,
        [itemId]
      );

      if (detalle.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No se encontraron imágenes' },
          { status: 404 }
        );
      }

      // Recopilar todas las imágenes no nulas en orden de prioridad
      const imagenes: string[] = [];
      const item = detalle[0];

      if (item.foto_portada) imagenes.push(item.foto_portada);
      if (item.foto1_url) imagenes.push(item.foto1_url);
      if (item.foto2_url) imagenes.push(item.foto2_url);
      if (item.foto3_url) imagenes.push(item.foto3_url);
      if (item.foto4_url) imagenes.push(item.foto4_url);

      return NextResponse.json({
        success: true,
        imagenes: imagenes
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en /api/stock-ambulante/imagenes:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al obtener imágenes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
