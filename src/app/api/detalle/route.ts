import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { getRateLimiter } from '@/lib/rate-limit';
export async function GET(request: NextRequest) {
  // 🔒 PROTECCIÓN: Rate limiting (30 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 30, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/detalle');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID requerido' },
        { status: 400 }
      );
    }
    const [rows]: any = await db.query(`
      SELECT 
        id.id,
        id.item_id,
        i.nombre as item_nombre,
        i.subcategoria_id,
        id.descripcion,
        id.material,
        id.espesor,
        id.proteccion,
        id.compatibilidad,
        id.pegamento,
        id.foto1_url,
        id.foto2_url,
        id.foto3_url,
        id.foto4_url,
        id.foto_portada,
        id.destacar,
        id.activo,
        -- Campos nuevos - Fundas
        id.interior,
        id.protector_camara,
        id.flexibilidad,
        id.colores_disenos,
        -- Campos nuevos - Popsockets
        id.adhesivo,
        id.compatibilidad_magsafe,
        id.soporte,
        -- Campos nuevos - Auriculares
        id.bluetooth,
        id.duracion_bateria,
        id.cancelacion_ruido,
        id.resistencia_agua,
        id.rgb,
        id.respuesta_frecuencia,
        id.sensibilidad,
        id.capacidad_bateria,
        id.largo_cable,
        -- Campos de visibilidad
        id.mostrar_descripcion,
        id.mostrar_material,
        id.mostrar_espesor,
        id.mostrar_proteccion,
        id.mostrar_compatibilidad,
        id.mostrar_pegamento,
        id.mostrar_interior,
        id.mostrar_protector_camara,
        id.mostrar_flexibilidad,
        id.mostrar_colores_disenos,
        id.mostrar_adhesivo,
        id.mostrar_compatibilidad_magsafe,
        id.mostrar_soporte,
        id.mostrar_bluetooth,
        id.mostrar_duracion_bateria,
        id.mostrar_cancelacion_ruido,
        id.mostrar_resistencia_agua,
        id.mostrar_rgb,
        id.mostrar_respuesta_frecuencia,
        id.mostrar_sensibilidad,
        id.mostrar_capacidad_bateria,
        id.mostrar_largo_cable
      FROM item_detalle id
      INNER JOIN items i ON id.item_id = i.id
      WHERE id.item_id = ?
    `, [id]);
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    const producto = rows[0];
    
    // ✅ FORMATEAR CON TODOS LOS CAMPOS
    const detalleProducto = {
      id: producto.id,
      item_id: producto.item_id,
      subcategoria_id: producto.subcategoria_id,
      item_nombre: producto.item_nombre,
      descripcion: producto.descripcion,
      material: producto.material,
      espesor: producto.espesor,
      proteccion: producto.proteccion,
      compatibilidad: producto.compatibilidad,
      pegamento: producto.pegamento,
      foto1_url: producto.foto1_url,
      foto2_url: producto.foto2_url,
      foto3_url: producto.foto3_url,
      foto4_url: producto.foto4_url,
      foto_portada: producto.foto_portada,
      destacar: Boolean(producto.destacar),
      activo: Boolean(producto.activo),
      // Campos nuevos - Fundas
      interior: producto.interior,
      protector_camara: producto.protector_camara,
      flexibilidad: producto.flexibilidad,
      colores_disenos: producto.colores_disenos,
      // Campos nuevos - Popsockets
      adhesivo: producto.adhesivo,
      compatibilidad_magsafe: producto.compatibilidad_magsafe,
      soporte: producto.soporte,
      // Campos nuevos - Auriculares
      bluetooth: producto.bluetooth,
      duracion_bateria: producto.duracion_bateria,
      cancelacion_ruido: producto.cancelacion_ruido,
      resistencia_agua: producto.resistencia_agua,
      rgb: producto.rgb,
      respuesta_frecuencia: producto.respuesta_frecuencia,
      sensibilidad: producto.sensibilidad,
      capacidad_bateria: producto.capacidad_bateria,
      largo_cable: producto.largo_cable,
      // Campos de visibilidad
      mostrar_descripcion: Boolean(producto.mostrar_descripcion),
      mostrar_material: Boolean(producto.mostrar_material),
      mostrar_espesor: Boolean(producto.mostrar_espesor),
      mostrar_proteccion: Boolean(producto.mostrar_proteccion),
      mostrar_compatibilidad: Boolean(producto.mostrar_compatibilidad),
      mostrar_pegamento: Boolean(producto.mostrar_pegamento),
      mostrar_interior: Boolean(producto.mostrar_interior),
      mostrar_protector_camara: Boolean(producto.mostrar_protector_camara),
      mostrar_flexibilidad: Boolean(producto.mostrar_flexibilidad),
      mostrar_colores_disenos: Boolean(producto.mostrar_colores_disenos),
      mostrar_adhesivo: Boolean(producto.mostrar_adhesivo),
      mostrar_compatibilidad_magsafe: Boolean(producto.mostrar_compatibilidad_magsafe),
      mostrar_soporte: Boolean(producto.mostrar_soporte),
      mostrar_bluetooth: Boolean(producto.mostrar_bluetooth),
      mostrar_duracion_bateria: Boolean(producto.mostrar_duracion_bateria),
      mostrar_cancelacion_ruido: Boolean(producto.mostrar_cancelacion_ruido),
      mostrar_resistencia_agua: Boolean(producto.mostrar_resistencia_agua),
      mostrar_rgb: Boolean(producto.mostrar_rgb),
      mostrar_respuesta_frecuencia: Boolean(producto.mostrar_respuesta_frecuencia),
      mostrar_sensibilidad: Boolean(producto.mostrar_sensibilidad),
      mostrar_capacidad_bateria: Boolean(producto.mostrar_capacidad_bateria),
      mostrar_largo_cable: Boolean(producto.mostrar_largo_cable)
    };
    console.log(`📦 Detalle obtenido - Item ID: ${id}, Subcategoria ID: ${producto.subcategoria_id}`);
    // ✅ DEVOLVER CON SUBCATEGORIA_ID
    return NextResponse.json({
      success: true,
      detalle: detalleProducto,
      subcategoria_id: producto.subcategoria_id, // ✅ AGREGAR para retrocompatibilidad
      // Campos existentes para retrocompatibilidad
      foto_portada: producto.foto_portada,
      foto1_url: producto.foto1_url,
      foto2_url: producto.foto2_url,
      foto3_url: producto.foto3_url,
      foto4_url: producto.foto4_url,
      descripcion: producto.descripcion,
      activo: Boolean(producto.activo)
    });
  } catch (error) {
    console.error('Error obteniendo detalle:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}