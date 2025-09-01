import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

// GET - Obtener recomendaciones por item_id
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'itemId es requerido' }, { status: 400 });
    }

    // Obtener el item_detalle_id
    const [itemDetalle]: any = await db.query(
      `SELECT id FROM item_detalle WHERE item_id = ? LIMIT 1`,
      [itemId]
    );

    if (!itemDetalle || itemDetalle.length === 0) {
      return NextResponse.json({ recomendaciones: [] });
    }

    // Obtener las recomendaciones (máximo 5, ordenadas)
    const [recomendaciones]: any = await db.query(
      `SELECT modelo_recomendado 
       FROM item_detalle_recomendaciones 
       WHERE item_detalle_id = ? 
       ORDER BY orden ASC, fecha_creacion ASC
       LIMIT 5`,
      [itemDetalle[0].id]
    );

    const modelos = recomendaciones.map((r: any) => r.modelo_recomendado);

    return NextResponse.json({ recomendaciones: modelos });

  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Guardar recomendaciones (hasta 5)
export async function POST(request: NextRequest) {
  try {
    const { itemId, recomendaciones } = await request.json();

    if (!itemId || !Array.isArray(recomendaciones)) {
      return NextResponse.json({ error: 'itemId y recomendaciones son requeridos' }, { status: 400 });
    }

    // Limitar a máximo 5 recomendaciones
    const recomendacionesLimitadas = recomendaciones.slice(0, 5);

    // Obtener el item_detalle_id
    const [itemDetalle]: any = await db.query(
      `SELECT id FROM item_detalle WHERE item_id = ? LIMIT 1`,
      [itemId]
    );

    if (!itemDetalle || itemDetalle.length === 0) {
      // Crear item_detalle si no existe
      const [result]: any = await db.query(
        `INSERT INTO item_detalle (item_id) VALUES (?)`,
        [itemId]
      );
      var itemDetalleId = result.insertId;
    } else {
      var itemDetalleId = itemDetalle[0].id;
    }

    // Eliminar recomendaciones existentes
    await db.query(
      `DELETE FROM item_detalle_recomendaciones WHERE item_detalle_id = ?`,
      [itemDetalleId]
    );

    // Insertar nuevas recomendaciones (hasta 5)
    if (recomendacionesLimitadas.length > 0) {
      const values = recomendacionesLimitadas.map((modelo: string, index: number) => 
        [itemDetalleId, modelo, index + 1]
      );

      await db.query(
        `INSERT INTO item_detalle_recomendaciones (item_detalle_id, modelo_recomendado, orden) VALUES ?`,
        [values]
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `${recomendacionesLimitadas.length} recomendaciones guardadas exitosamente`,
      count: recomendacionesLimitadas.length,
      limitado: recomendaciones.length > 5 ? `Se limitaron a 5 de ${recomendaciones.length} recomendaciones` : null
    });

  } catch (error) {
    console.error('Error al guardar recomendaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}