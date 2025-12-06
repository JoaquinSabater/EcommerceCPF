import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { sanitizeInput } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    // 🔒 PROTECCIÓN: Verificar token de prospecto
    const prospectoToken = request.cookies.get('prospecto_token')?.value;
    
    if (!prospectoToken) {
      console.warn('🚨 INTENTO DE CREAR PEDIDO DE PROSPECTO SIN TOKEN');
      return NextResponse.json(
        { error: 'Token de prospecto requerido' },
        { status: 401 }
      );
    }

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

    // Validar que el token pertenece al prospecto
    const [prospectos]: any = await connection.query(
      'SELECT id, nombre, token FROM prospectos WHERE token = ? AND id = ?',
      [prospectoToken, prospectoData?.id]
    );

    if (prospectos.length === 0) {
      console.error('🚨 TOKEN DE PROSPECTO INVÁLIDO:', {
        providedToken: prospectoToken?.substring(0, 10) + '...',
        prospectoId: prospectoData?.id
      });
      return NextResponse.json(
        { error: 'Token de prospecto inválido' },
        { status: 403 }
      );
    }

    await connection.beginTransaction();

  // console.log('🟡 === CREANDO PEDIDO PRELIMINAR DE PROSPECTO ===');
  // console.log('Prospecto:', prospectoData?.nombre, 'ID:', prospectoData?.id);
  // console.log('Items:', itemsCarrito.length);

    const [pedidoResult] = await connection.query(
      `INSERT INTO pedido_preliminar 
       (cliente_id, vendedor_id, prospecto_id, observaciones_generales) 
       VALUES (NULL, NULL, ?, ?)`,
      [
        prospectoData?.id || null, 
        observaciones || `Pedido de prospecto: ${prospectoData?.nombre || 'Sin nombre'}`
      ]
    );

    const pedidoPreliminarId = (pedidoResult as any).insertId;
    // console.log('🟢 Pedido preliminar creado con ID:', pedidoPreliminarId);
    // console.log('🟢 Asociado al prospecto ID:', prospectoData?.id);

    for (const item of itemsCarrito) {
      const [articuloExists] = await connection.query(
        'SELECT codigo_interno FROM articulos WHERE codigo_interno = ?',
        [item.codigo_interno]
      );

      if ((articuloExists as any).length === 0) {
        throw new Error(`Artículo con código ${item.codigo_interno} no encontrado`);
      }

      const [detalleResult] = await connection.query(
        `INSERT INTO pedido_preliminar_detalle 
         (pedido_preliminar_id, articulo_codigo_interno, cantidad_solicitada, precio_unitario) 
         VALUES (?, ?, ?, ?)`,
        [pedidoPreliminarId, item.codigo_interno, item.cantidad, item.precio]
      );

      const detalleId = (detalleResult as any).insertId;

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
    // console.log('🟢 === PEDIDO DE PROSPECTO CREADO EXITOSAMENTE ===');

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