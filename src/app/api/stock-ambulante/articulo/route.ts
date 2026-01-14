import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigoInterno = searchParams.get('codigo');

    if (!codigoInterno) {
      return NextResponse.json(
        { success: false, message: 'Código interno requerido' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    try {
      // Buscar en la tabla articulos usando codigo_interno
      const [articulos]: any = await connection.execute(
        `SELECT 
          a.item_id,
          a.codigo_interno,
          a.modelo,
          d.foto_portada,
          d.foto1_url
        FROM articulos a
        LEFT JOIN item_detalle d ON a.item_id = d.item_id
        WHERE a.codigo_interno = ?
        LIMIT 1`,
        [codigoInterno]
      );

      if (articulos.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Artículo no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: articulos[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en /api/stock-ambulante/articulo:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al obtener información del artículo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
