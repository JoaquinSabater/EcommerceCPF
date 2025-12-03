import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID requerido' },
        { status: 400 }
      );
    }

    // ✅ CONSULTA ACTUALIZADA: Incluir subcategoria_id desde la tabla items
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
        id.activo
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
    
    // ✅ FORMATEAR CON SUBCATEGORIA_ID
    const detalleProducto = {
      id: producto.id,
      item_id: producto.item_id,
      subcategoria_id: producto.subcategoria_id, // ✅ AGREGAR
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
      activo: Boolean(producto.activo)
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