import { NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function POST(request: Request) {
  let connection;
  
  try {
    const {
      prospectoData,
      itemsCarrito,
      observaciones
    } = await request.json();

    if (!itemsCarrito || itemsCarrito.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    console.log('🟡 === CREANDO PEDIDO PRELIMINAR DE PROSPECTO ===');
    console.log('Prospecto:', prospectoData?.nombre, 'ID:', prospectoData?.id);
    console.log('Items:', itemsCarrito.length);

    // ✅ 1. Crear pedido preliminar con cliente_id = NULL, vendedor_id = NULL y prospecto_id = ID del prospecto
    const [pedidoResult] = await connection.query(
      `INSERT INTO pedido_preliminar 
       (cliente_id, vendedor_id, prospecto_id, observaciones_generales) 
       VALUES (NULL, NULL, ?, ?)`,
      [
        prospectoData?.id || null, // Guardar ID del prospecto
        observaciones || `Pedido de prospecto: ${prospectoData?.nombre || 'Sin nombre'}`
      ]
    );

    const pedidoPreliminarId = (pedidoResult as any).insertId;
    console.log('🟢 Pedido preliminar creado con ID:', pedidoPreliminarId);
    console.log('🟢 Asociado al prospecto ID:', prospectoData?.id);

    // ✅ 2. Insertar detalles del pedido
    for (const item of itemsCarrito) {
      // Verificar que el artículo existe
      const [articuloExists] = await connection.query(
        'SELECT codigo_interno FROM articulos WHERE codigo_interno = ?',
        [item.codigo_interno]
      );

      if ((articuloExists as any).length === 0) {
        throw new Error(`Artículo con código ${item.codigo_interno} no encontrado`);
      }

      // Insertar detalle del pedido
      const [detalleResult] = await connection.query(
        `INSERT INTO pedido_preliminar_detalle 
         (pedido_preliminar_id, articulo_codigo_interno, cantidad_solicitada, precio_unitario) 
         VALUES (?, ?, ?, ?)`,
        [pedidoPreliminarId, item.codigo_interno, item.cantidad, item.precio]
      );

      const detalleId = (detalleResult as any).insertId;

      // Insertar sugerencia si existe
      if (item.sugerencia && item.sugerencia.trim() !== '') {
        await connection.query(
          `INSERT INTO pedido_preliminar_detalle_sugerencias 
           (pedido_preliminar_detalle_id, sugerencia) 
           VALUES (?, ?)`,
          [detalleId, item.sugerencia.trim()]
        );
      }
    }

    await connection.commit();
    console.log('🟢 === PEDIDO DE PROSPECTO CREADO EXITOSAMENTE ===');

    return NextResponse.json({
      success: true,
      pedidoPreliminarId,
      prospectoId: prospectoData?.id,
      message: 'Pedido preliminar de prospecto creado exitosamente'
    });

  } catch (error) {
    console.error('🔴 Error creando pedido de prospecto:', error);
    
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('🔴 Error en rollback:', rollbackError);
      }
    }

    return NextResponse.json(
      { error: 'Error al crear el pedido preliminar' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('🔴 Error al liberar conexión:', releaseError);
      }
    }
  }
}