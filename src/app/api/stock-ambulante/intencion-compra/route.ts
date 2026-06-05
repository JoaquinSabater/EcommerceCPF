import { NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { ResultSetHeader } from 'mysql2';

interface ItemIntencionPayload {
  codigo_interno: string;
  cantidad_solicitada: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      cliente_id,
      prospecto_id,
      cliente_nombre,
      usuario_id,
      codigo_interno,
      cantidad_solicitada,
      token_link,
      items
    } = body;

    const normalizarCantidad = (value: unknown): number => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const itemsPayload: ItemIntencionPayload[] = Array.isArray(items)
      ? items
          .map((item) => ({
            codigo_interno: String(item?.codigo_interno ?? '').trim(),
            cantidad_solicitada: normalizarCantidad(item?.cantidad_solicitada)
          }))
          .filter((item) => item.codigo_interno.length > 0)
      : [];

    // Compatibilidad con payload legacy de un solo item
    if (itemsPayload.length === 0 && codigo_interno) {
      itemsPayload.push({
        codigo_interno: String(codigo_interno).trim(),
        cantidad_solicitada: normalizarCantidad(cantidad_solicitada)
      });
    }

    // Validaciones
    // Requerimos al menos cliente_id o prospecto_id, además de usuario_id e items válidos
    if ((!cliente_id && !prospecto_id) || !usuario_id || itemsPayload.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos: (cliente_id o prospecto_id), usuario_id, items' 
        },
        { status: 400 }
      );
    }

    if (itemsPayload.some((item) => item.cantidad_solicitada <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Todas las cantidades deben ser mayores a 0' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();
    const insertados: Array<{ id: number; codigo_interno: string; cantidad_solicitada: number }> = [];

    try {
      await connection.beginTransaction();

      for (const item of itemsPayload) {
        const [result] = await connection.query<ResultSetHeader>(
          `INSERT INTO intencion_de_compra (
            cliente_id,
            prospecto_id,
            cliente_nombre,
            usuario_id,
            codigo_interno,
            cantidad_solicitada,
            token_link
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            cliente_id ?? null,
            prospecto_id ?? null,
            cliente_nombre ?? null,
            usuario_id,
            item.codigo_interno,
            item.cantidad_solicitada,
            token_link
          ]
        );

        insertados.push({
          id: result.insertId,
          codigo_interno: item.codigo_interno,
          cantidad_solicitada: item.cantidad_solicitada
        });
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    console.log('✅ Intención de compra creada:', {
      total: insertados.length,
      cliente_id,
      prospecto_id,
      usuario_id
    });

    return NextResponse.json({
      success: true,
      message: 'Intenciones de compra registradas exitosamente',
      data: {
        cliente_id,
        prospecto_id,
        usuario_id,
        total: insertados.length,
        items: insertados
      },
      items: insertados
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
    const prospectoId = searchParams.get('prospecto_id');
    const usuarioId = searchParams.get('usuario_id');

    let query = 'SELECT * FROM intencion_de_compra WHERE 1=1';
    const params: any[] = [];

    if (clienteId) {
      query += ' AND cliente_id = ?';
      params.push(clienteId);
    }

    if (prospectoId) {
      query += ' AND prospecto_id = ?';
      params.push(prospectoId);
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
