import { NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { crearPedidoPreliminar } from '@/data/data';

export async function POST(request: Request) {
  let connection;
  
  try {
    const {
      prospectoId,
      razon_social,
      nombre,
      email,
      telefono,
      cuit_dni,
      provincia_id,
      localidad_id,
      negocio,
      observaciones,
      itemsCarrito
    } = await request.json();

    if (!razon_social || !telefono || !cuit_dni || !provincia_id || !localidad_id) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    console.log('🟢 === INICIO CONVERSIÓN PROSPECTO A CLIENTE ===');
    console.log('Prospecto ID:', prospectoId);
    console.log('Datos cliente:', { razon_social, nombre, cuit_dni });

    const [existeCliente] = await connection.query(
      'SELECT id FROM clientes WHERE cuit_dni = ?',
      [cuit_dni]
    );

    if ((existeCliente as any[]).length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Ya existe un cliente con ese CUIT/CUIL' },
        { status: 400 }
      );
    }

    const [clienteResult] = await connection.query(
      `INSERT INTO clientes 
       (razon_social, nombre, email, telefono, cuit_dni, vendedor_id, 
        localidad_id, observaciones, prospecto_id, habilitado, fecha_creacion) 
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, 1, NOW())`,
      [
        razon_social, 
        nombre, 
        email, 
        telefono, 
        cuit_dni, 
        localidad_id, 
        `Negocio: ${negocio || 'No especificado'}\nObservaciones: ${observaciones || 'Ninguna'}\nConvertido desde prospecto`, 
        prospectoId
      ]
    );

    const clienteId = (clienteResult as any).insertId;
    console.log('🟢 Cliente creado con ID:', clienteId);

    if (prospectoId) {
      await connection.query(
        'UPDATE prospectos SET convertido = 1 WHERE id = ?',
        [prospectoId]
      );
      console.log('🟢 Prospecto marcado como convertido');
    }

    await connection.commit();
    
    console.log('🟡 Creando pedido preliminar...');
    const pedidoPreliminarId = await crearPedidoPreliminar(
      clienteId,
      itemsCarrito,
      `Primer pedido del cliente convertido desde prospecto ${prospectoId || 'N/A'}`
    );

    console.log('🟢 === CONVERSIÓN COMPLETADA EXITOSAMENTE ===');
    console.log('Cliente ID:', clienteId);
    console.log('Pedido preliminar ID:', pedidoPreliminarId);

    return NextResponse.json({
      success: true,
      clienteId,
      pedidoPreliminarId,
      message: 'Cliente creado y pedido generado exitosamente'
    });

  } catch (error) {
    console.error('🔴 Error en conversión prospecto a cliente:', error);
    
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('🔴 Error en rollback:', rollbackError);
      }
    }

    return NextResponse.json(
      { error: 'Error al crear cliente y pedido' },
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