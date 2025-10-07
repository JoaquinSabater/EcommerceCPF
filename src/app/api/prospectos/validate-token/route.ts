import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { isTokenExpired } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token requerido' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.query('SET SESSION wait_timeout=300');
    await connection.query('SET SESSION interactive_timeout=300');

    const [tokenRows] = await connection.query(
      `SELECT pt.prospecto_id, pt.expires_at, pt.used, 
              p.nombre, p.email, p.telefono, p.cuit, p.negocio
       FROM prospectos_tokens pt
       JOIN prospectos p ON pt.prospecto_id = p.id 
       WHERE pt.token = ?`,
      [token]
    );

    if ((tokenRows as any).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 400 }
      );
    }

    const tokenData = (tokenRows as any)[0];

    if (isTokenExpired(new Date(tokenData.expires_at))) {
      return NextResponse.json(
        { success: false, message: 'El link ha expirado (4 días). Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    console.log(`✅ Token válido para prospecto: ${tokenData.nombre} (uso múltiple permitido)`);

    return NextResponse.json({
      success: true,
      message: 'Token válido',
      prospecto: {
        id: tokenData.prospecto_id,
        nombre: tokenData.nombre,
        email: tokenData.email,
        telefono: tokenData.telefono,
        cuit: tokenData.cuit,
        negocio: tokenData.negocio
      }
    });

  } catch (error) {
    console.error('❌ Error validando token:', error);
    return NextResponse.json(
      { success: false, message: 'Error al validar token' },
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