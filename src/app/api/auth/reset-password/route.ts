import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { ResetPasswordRequest } from '@/types/types';
import { hashPassword } from '@/lib/bcrypt';
import { isTokenExpired } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { token, password, newPassword }: ResetPasswordRequest = await request.json();
    
    const passwordToHash = password || newPassword;

    if (!token || !passwordToHash) {
      return NextResponse.json(
        { success: false, message: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (passwordToHash.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.query('SET SESSION wait_timeout=300');
    await connection.query('SET SESSION interactive_timeout=300');

    const [authRows] = await connection.query(
      `SELECT ca.cliente_id, ca.reset_token_expires, c.nombre, c.apellido 
       FROM clientes_auth ca
       JOIN clientes c ON ca.cliente_id = c.id 
       WHERE ca.reset_token = ?`,
      [token]
    );

    if ((authRows as any).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    const authData = (authRows as any)[0];

    if (isTokenExpired(new Date(authData.reset_token_expires))) {
      return NextResponse.json(
        { success: false, message: 'El token ha expirado. Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(passwordToHash);

    await connection.query(
      `UPDATE clientes_auth 
       SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL 
       WHERE cliente_id = ?`,
      [hashedPassword, authData.cliente_id]
    );

    console.log(`✅ Contraseña restablecida para: ${authData.nombre} ${authData.apellido} (ID: ${authData.cliente_id})`);

    return NextResponse.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.'
    });

  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud. Intenta nuevamente.' },
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