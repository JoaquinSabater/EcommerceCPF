import { NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('cliente_id');

    if (!clienteId) {
      return NextResponse.json(
        { success: false, error: 'cliente_id es requerido' },
        { status: 400 }
      );
    }

    // Obtener información del cliente
    const cliente = await db.query(
      `SELECT 
        id,
        nombre,
        razon_social,
        cuit_dni,
        telefono,
        email
      FROM clientes 
      WHERE id = ?`,
      [clienteId]
    );

    console.log('📊 Consulta cliente resultado:', cliente);

    // db.query puede devolver un array de arrays, accedemos correctamente
    const clienteData = Array.isArray(cliente[0]) ? cliente[0][0] : cliente[0];

    if (!clienteData) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }
    
    console.log('✅ Cliente encontrado:', clienteData);

    return NextResponse.json({
      success: true,
      data: clienteData
    });

  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener información del cliente' },
      { status: 500 }
    );
  }
}
