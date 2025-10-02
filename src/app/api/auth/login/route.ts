import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/data/mysql';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key';

export async function POST(request: Request) {
  try {
    const { cuil, password } = await request.json();

    if (!cuil) {
      return NextResponse.json(
        { success: false, message: 'CUIL es requerido' },
        { status: 400 }
      );
    }

    // Buscar cliente por CUIL incluyendo razon_social para detectar admin
    const [clienteRows] = await db.execute(
      'SELECT id, cuit_dni, razon_social, nombre, apellido, email, telefono, vendedor_id, habilitado FROM clientes WHERE cuit_dni = ?',
      [cuil]
    ) as [Array<{
      id: number;
      cuit_dni: string;
      razon_social: string; // ✅ Agregar razon_social
      nombre: string;
      apellido: string;
      email: string;
      telefono: string;
      vendedor_id: number;
      habilitado: number;
    }>, any];

    if (clienteRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    const cliente = clienteRows[0];

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

    // ✅ Detectar si es administrador
    const isAdmin = cliente.razon_social === 'Administrador' || cliente.id === 2223;

    // Buscar datos de autenticación
    const [authRows] = await db.execute(
      'SELECT id, cliente_id, password_hash, email_verified, failed_login_attempts, locked_until FROM clientes_auth WHERE cliente_id = ?',
      [cliente.id]
    ) as [Array<{
      id: number;
      cliente_id: number;
      password_hash: string | null;
      email_verified: number;
      failed_login_attempts: number;
      locked_until: Date | string | null;
    }>, any];

    // Si no hay registro de auth, crear uno
    if (authRows.length === 0) {
      await db.execute(
        'INSERT INTO clientes_auth (cliente_id, email_verified, failed_login_attempts) VALUES (?, 0, 0)',
        [cliente.id]
      );
    }

    const auth = authRows[0] || { password_hash: null, failed_login_attempts: 0, locked_until: null };

    // Verificar si la cuenta está bloqueada
    if (auth.locked_until && new Date() < new Date(auth.locked_until)) {
      return NextResponse.json(
        { success: false, message: 'Cuenta bloqueada temporalmente' },
        { status: 423 }
      );
    }

    // Si no se proporciona contraseña, permitir acceso (solo CUIL)
    if (!password) {
      // Resetear intentos fallidos
      if (authRows.length > 0) {
        await db.execute(
          'UPDATE clientes_auth SET failed_login_attempts = 0, locked_until = NULL WHERE cliente_id = ?',
          [cliente.id]
        );
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          clienteId: cliente.id,
          cuil: cliente.cuit_dni,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          vendedorId: cliente.vendedor_id,
          isAdmin // ✅ Agregar isAdmin al token
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        success: true,
        message: 'Login exitoso',
        token,
        cliente: {
          id: cliente.id,
          cuil: cliente.cuit_dni,
          razon_social: cliente.razon_social, // ✅ Agregar razon_social
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          email: cliente.email,
          telefono: cliente.telefono,
          vendedor_id: cliente.vendedor_id,
          isAdmin // ✅ Agregar isAdmin
        }
      });
    }

    // Si se proporciona contraseña, validarla
    if (!auth.password_hash) {
      return NextResponse.json(
        { success: false, message: 'No tienes contraseña configurada. Puedes ingresar solo con tu CUIL.' },
        { status: 400 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, auth.password_hash);

    if (!isValidPassword) {
      // Incrementar intentos fallidos
      const newAttempts = (auth.failed_login_attempts || 0) + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await db.execute(
        'UPDATE clientes_auth SET failed_login_attempts = ?, locked_until = ? WHERE cliente_id = ?',
        [newAttempts, lockUntil, cliente.id]
      );

      if (lockUntil) {
        return NextResponse.json(
          { success: false, message: 'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.' },
          { status: 423 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Login exitoso - resetear intentos fallidos
    await db.execute(
      'UPDATE clientes_auth SET failed_login_attempts = 0, locked_until = NULL WHERE cliente_id = ?',
      [cliente.id]
    );

    // Generar token JWT
    const token = jwt.sign(
      { 
        clienteId: cliente.id,
        cuil: cliente.cuit_dni,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        vendedorId: cliente.vendedor_id,
        isAdmin // ✅ Agregar isAdmin al token
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      token,
      cliente: {
        id: cliente.id,
        cuil: cliente.cuit_dni,
        razon_social: cliente.razon_social, // ✅ Agregar razon_social
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono,
        vendedor_id: cliente.vendedor_id,
        isAdmin // ✅ Agregar isAdmin
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}