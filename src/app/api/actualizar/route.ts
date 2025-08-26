import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');
    
    const body = await request.json();
    const finalProductId = productId || body.item_id;

    if (!finalProductId) {
      return NextResponse.json(
        { error: 'ID del producto es requerido' },
        { status: 400 }
      );
    }

    const {
      descripcion,
      material,
      espesor,
      proteccion,
      compatibilidad,
      pegamento,
      foto_portada,
      foto1_url,
      foto2_url,
      foto3_url,
      foto4_url,
      destacar // ✅ Agregar este campo
    } = body;

    console.log('Datos recibidos para actualizar:', {
      productId: finalProductId,
      destacar, // ✅ Log para debug
      foto_portada,
      foto1_url,
      foto2_url,
      foto3_url,
      foto4_url
    });

    // ✅ Actualizar la consulta SQL para incluir destacar
    const [result]: any = await db.query(
      `UPDATE item_detalle 
       SET
         descripcion = ?,
         material = ?,
         espesor = ?,
         proteccion = ?,
         compatibilidad = ?,
         pegamento = ?,
         foto_portada = ?, 
         foto1_url = ?,
         foto2_url = ?,
         foto3_url = ?,
         foto4_url = ?,
         destacar = ?
       WHERE item_id = ?`,
      [
        descripcion || null,
        material || null,
        espesor || null,
        proteccion || null,
        compatibilidad || null,
        pegamento || null,
        foto_portada || null,
        foto1_url,
        foto2_url || null,
        foto3_url || null,
        foto4_url || null,
        destacar ? 1 : 0, // ✅ Convertir boolean a tinyint
        finalProductId
      ]
    );

    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    console.log(`✅ Producto actualizado: ID ${finalProductId}, destacar: ${destacar}, foto_portada: ${foto_portada}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Producto actualizado exitosamente',
      productId: finalProductId,
      affectedRows: result.affectedRows,
      updatedFields: {
        destacar,
        foto_portada,
        foto1_url,
        foto2_url,
        foto3_url,
        foto4_url
      }
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}