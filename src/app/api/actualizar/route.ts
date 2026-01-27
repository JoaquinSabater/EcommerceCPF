import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { requireAdmin, validateId } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  // 🔒 PROTECCIÓN: Solo administradores pueden actualizar productos
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const { user } = authResult;

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
      destacar,
      activo,
      // Campos nuevos - Fundas
      interior,
      protector_camara,
      flexibilidad,
      colores_disenos,
      // Campos nuevos - Popsockets
      adhesivo,
      compatibilidad_magsafe,
      soporte,
      // Campos nuevos - Auriculares
      bluetooth,
      duracion_bateria,
      cancelacion_ruido,
      resistencia_agua,
      rgb,
      respuesta_frecuencia,
      sensibilidad,
      capacidad_bateria,
      largo_cable,
      // Campos de visibilidad
      mostrar_descripcion,
      mostrar_material,
      mostrar_espesor,
      mostrar_proteccion,
      mostrar_compatibilidad,
      mostrar_pegamento,
      mostrar_interior,
      mostrar_protector_camara,
      mostrar_flexibilidad,
      mostrar_colores_disenos,
      mostrar_adhesivo,
      mostrar_compatibilidad_magsafe,
      mostrar_soporte,
      mostrar_bluetooth,
      mostrar_duracion_bateria,
      mostrar_cancelacion_ruido,
      mostrar_resistencia_agua,
      mostrar_rgb,
      mostrar_respuesta_frecuencia,
      mostrar_sensibilidad,
      mostrar_capacidad_bateria,
      mostrar_largo_cable
    } = body;

    //console.log('Datos recibidos para actualizar:', {
    //  productId: finalProductId,
    //  destacar,
    //  activo, // ✅ Log del nuevo campo
    //  foto_portada,
    //  foto1_url
    //});
    //});

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
         destacar = ?,
         activo = ?,
         interior = ?,
         protector_camara = ?,
         flexibilidad = ?,
         colores_disenos = ?,
         adhesivo = ?,
         compatibilidad_magsafe = ?,
         soporte = ?,
         bluetooth = ?,
         duracion_bateria = ?,
         cancelacion_ruido = ?,
         resistencia_agua = ?,
         rgb = ?,
         respuesta_frecuencia = ?,
         sensibilidad = ?,
         capacidad_bateria = ?,
         largo_cable = ?,
         mostrar_descripcion = ?,
         mostrar_material = ?,
         mostrar_espesor = ?,
         mostrar_proteccion = ?,
         mostrar_compatibilidad = ?,
         mostrar_pegamento = ?,
         mostrar_interior = ?,
         mostrar_protector_camara = ?,
         mostrar_flexibilidad = ?,
         mostrar_colores_disenos = ?,
         mostrar_adhesivo = ?,
         mostrar_compatibilidad_magsafe = ?,
         mostrar_soporte = ?,
         mostrar_bluetooth = ?,
         mostrar_duracion_bateria = ?,
         mostrar_cancelacion_ruido = ?,
         mostrar_resistencia_agua = ?,
         mostrar_rgb = ?,
         mostrar_respuesta_frecuencia = ?,
         mostrar_sensibilidad = ?,
         mostrar_capacidad_bateria = ?,
         mostrar_largo_cable = ?
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
        destacar ? 1 : 0, 
        activo ? 1 : 0,
        interior || null,
        protector_camara || null,
        flexibilidad || null,
        colores_disenos || null,
        adhesivo || null,
        compatibilidad_magsafe || null,
        soporte || null,
        bluetooth || null,
        duracion_bateria || null,
        cancelacion_ruido || null,
        resistencia_agua || null,
        rgb || null,
        respuesta_frecuencia || null,
        sensibilidad || null,
        capacidad_bateria || null,
        largo_cable || null,
        mostrar_descripcion ? 1 : 0,
        mostrar_material ? 1 : 0,
        mostrar_espesor ? 1 : 0,
        mostrar_proteccion ? 1 : 0,
        mostrar_compatibilidad ? 1 : 0,
        mostrar_pegamento ? 1 : 0,
        mostrar_interior ? 1 : 0,
        mostrar_protector_camara ? 1 : 0,
        mostrar_flexibilidad ? 1 : 0,
        mostrar_colores_disenos ? 1 : 0,
        mostrar_adhesivo ? 1 : 0,
        mostrar_compatibilidad_magsafe ? 1 : 0,
        mostrar_soporte ? 1 : 0,
        mostrar_bluetooth ? 1 : 0,
        mostrar_duracion_bateria ? 1 : 0,
        mostrar_cancelacion_ruido ? 1 : 0,
        mostrar_resistencia_agua ? 1 : 0,
        mostrar_rgb ? 1 : 0,
        mostrar_respuesta_frecuencia ? 1 : 0,
        mostrar_sensibilidad ? 1 : 0,
        mostrar_capacidad_bateria ? 1 : 0,
        mostrar_largo_cable ? 1 : 0,
        finalProductId
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    //console.log(`✅ Producto actualizado: ID ${finalProductId}, destacar: ${destacar}, activo: ${activo}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Producto actualizado exitosamente',
      productId: finalProductId,
      affectedRows: result.affectedRows,
      updatedFields: {
        destacar,
        activo, // ✅ Incluir en respuesta
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