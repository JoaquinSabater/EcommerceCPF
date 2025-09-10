import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/data/mysql';
import { isTokenExpired } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();

    // Buscar token en la base de datos
    const [tokenRows] = await connection.query(
      `SELECT ca.cliente_id, ca.reset_token_expires, c.email, c.nombre 
       FROM clientes_auth ca 
       JOIN clientes c ON ca.cliente_id = c.id 
       WHERE ca.reset_token = ?`,
      [token]
    );

    if ((tokenRows as any).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    const tokenData = (tokenRows as any)[0];

    // Verificar si el token ha expirado
    if (isTokenExpired(new Date(tokenData.reset_token_expires))) {
      return NextResponse.json(
        { success: false, message: 'El token ha expirado. Solicita un nuevo enlace.' },
        { status: 400 }
      );
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizar la contraseña del cliente
    await connection.query(
      'UPDATE clientes SET password = ? WHERE id = ?',
      [hashedPassword, tokenData.cliente_id]
    );

    // Eliminar el token usado
    await connection.query(
      'UPDATE clientes_auth SET reset_token = NULL, reset_token_expires = NULL WHERE cliente_id = ?',
      [tokenData.cliente_id]
    );

    console.log(`✅ Contraseña restablecida para: ${tokenData.email}`);

    return NextResponse.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.'
    });

  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    return NextResponse.json(
      { success: false, message: 'Error al restablecer la contraseña. Intenta nuevamente.' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('🔴 Error al liberar conexión en reset-password:', releaseError);
      }
    }
  }
}