import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { SetPasswordRequest } from '@/types/types';
import { hashPassword } from '@/lib/bcrypt';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { cuil, newPassword, confirmPassword }: SetPasswordRequest = await request.json();

    if (!cuil || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.query('SET SESSION wait_timeout=300');
    await connection.query('SET SESSION interactive_timeout=300');

    // Verificar que el cliente existe
    const [clienteRows] = await connection.query(
      `SELECT id, nombre, apellido FROM clientes WHERE cuit_dni = ?`,
      [cuil]
    );

    if ((clienteRows as any).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    const cliente = (clienteRows as any)[0];

    // ✅ VERIFICAR SI YA TIENE CONTRASEÑA CONFIGURADA
    const [authRows] = await connection.query(
      `SELECT password_hash FROM clientes_auth WHERE cliente_id = ?`,
      [cliente.id]
    );

    const yaTienePassword = authRows && (authRows as any).length > 0 && (authRows as any)[0].password_hash;

    if (yaTienePassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ya tienes una contraseña configurada. Si la olvidaste, usa la opción "Recuperar contraseña"',
          hasPassword: true 
        },
        { status: 400 }
      );
    }

    // Solo llegar aquí si NO tiene contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Crear registro de autenticación (primera vez)
    await connection.query(
      `INSERT INTO clientes_auth (cliente_id, password_hash) VALUES (?, ?)`,
      [cliente.id, hashedPassword]
    );

    console.log(`✅ Primera contraseña configurada para: ${cliente.nombre} ${cliente.apellido} (ID: ${cliente.id})`);

    return NextResponse.json({
      success: true,
      message: 'Contraseña configurada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en set-password:', error);
    return NextResponse.json(
      { success: false, message: 'Error al configurar contraseña' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}