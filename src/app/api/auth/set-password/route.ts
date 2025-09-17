import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/data/mysql';

export async function POST(request: Request) {
  try {
    const { cuil, newPassword, confirmPassword } = await request.json();

    // Validaciones básicas
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

    // Buscar cliente por CUIL incluyendo la columna habilitado
    const [clienteRows] = await db.execute(
      'SELECT id, habilitado FROM clientes WHERE cuit_dni = ?',
      [cuil]
    ) as [any[], any];

    if ((clienteRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    const cliente = (clienteRows as any[])[0];

    // Verificar si el cliente está habilitado
    if (!cliente.habilitado) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tu cuenta no está habilitada para usar el carrito de compras. Contacta a tu vendedor.',
          disabled: true 
        },
        { status: 403 }
      );
    }

    // Verificar si ya tiene contraseña configurada
    const [authRows] = await db.execute(
      'SELECT id, password_hash FROM clientes_auth WHERE cliente_id = ?',
      [cliente.id]
    ) as [any[], any];

    if ((authRows as any[]).length > 0 && (authRows as any[])[0].password_hash) {
      return NextResponse.json(
        { success: false, message: 'Ya tienes una contraseña configurada', hasPassword: true },
        { status: 400 }
      );
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Si no existe registro de auth, crearlo
    if (authRows.length === 0) {
      await db.execute(
        'INSERT INTO clientes_auth (cliente_id, password_hash, email_verified, failed_login_attempts) VALUES (?, ?, 0, 0)',
        [cliente.id, hashedPassword]
      );
    } else {
      // Actualizar contraseña existente
      await db.execute(
        'UPDATE clientes_auth SET password_hash = ?, failed_login_attempts = 0, locked_until = NULL WHERE cliente_id = ?',
        [hashedPassword, cliente.id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña configurada exitosamente'
    });

  } catch (error) {
    console.error('Error al configurar contraseña:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}