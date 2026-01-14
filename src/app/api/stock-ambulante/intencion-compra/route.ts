import { NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      cliente_id,
      cliente_nombre,
      usuario_id,
      codigo_interno,
      cantidad_solicitada,
      token_link
    } = body;

    // Validaciones
    if (!cliente_id || !usuario_id || !codigo_interno || !cantidad_solicitada) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos: cliente_id, usuario_id, codigo_interno, cantidad_solicitada' 
        },
        { status: 400 }
      );
    }

    if (cantidad_solicitada <= 0) {
      return NextResponse.json(
        { success: false, error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Insertar la intención de compra
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO intencion_de_compra (
        cliente_id,
        cliente_nombre,
        usuario_id,
        codigo_interno,
        cantidad_solicitada,
        token_link
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cliente_id,
        cliente_nombre,
        usuario_id,
        codigo_interno,
        cantidad_solicitada,
        token_link
      ]
    );

    const insertId = result.insertId;

    console.log('✅ Intención de compra creada:', {
      id: insertId,
      cliente_id,
      codigo_interno,
      cantidad_solicitada
    });

    return NextResponse.json({
      success: true,
      message: 'Intención de compra registrada exitosamente',
      data: {
        id: insertId,
        cliente_id,
        codigo_interno,
        cantidad_solicitada
      }
    });

  } catch (error) {
    console.error('Error al crear intención de compra:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar la intención de compra' },
      { status: 500 }
    );
  }
}

// GET: Obtener intenciones de compra por cliente o usuario
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('cliente_id');
    const usuarioId = searchParams.get('usuario_id');

    let query = 'SELECT * FROM intencion_de_compra WHERE 1=1';
    const params: any[] = [];

    if (clienteId) {
      query += ' AND cliente_id = ?';
      params.push(clienteId);
    }

    if (usuarioId) {
      query += ' AND usuario_id = ?';
      params.push(usuarioId);
    }

    query += ' ORDER BY fecha_creacion DESC';

    const intenciones = await db.query(query, params);

    return NextResponse.json({
      success: true,
      data: Array.isArray(intenciones[0]) ? intenciones[0] : intenciones
    });

  } catch (error) {
    console.error('Error al obtener intenciones de compra:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener las intenciones de compra' },
      { status: 500 }
    );
  }
}
