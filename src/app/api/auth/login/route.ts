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

    // ✅ AGREGAR EL CAMPO contenidoEspecial EN LA CONSULTA
    const [clienteRows] = await db.execute(
      'SELECT id, cuit_dni, razon_social, nombre, apellido, email, telefono, vendedor_id, habilitado, Distribuidor, contenidoEspecial FROM clientes WHERE cuit_dni = ?',
      [cuil]
    ) as [Array<{
      id: number;
      cuit_dni: string;
      razon_social: string;
      nombre: string;
      apellido: string;
      email: string;
      telefono: string;
      vendedor_id: number;
      habilitado: number;
      Distribuidor: number;
      contenidoEspecial: number; // ✅ NUEVO CAMPO
    }>, any];

    if (clienteRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    const cliente = clienteRows[0];

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

    const isAdmin = cliente.razon_social === 'Administrador' || cliente.id === 2223;
    const isDistribuidor = Boolean(cliente.Distribuidor);

    const [authRows] = await db.execute(
      'SELECT id, cliente_id, password_hash, email_verified FROM clientes_auth WHERE cliente_id = ?',
      [cliente.id]
    ) as [Array<{
      id: number;
      cliente_id: number;
      password_hash: string | null;
      email_verified: number;
    }>, any];

    if (authRows.length === 0) {
      await db.execute(
        'INSERT INTO clientes_auth (cliente_id, email_verified) VALUES (?, 0)',
        [cliente.id]
      );
    }

    const auth = authRows[0] || { password_hash: null };

    if (!password) {
      // ✅ Generar token JWT CON contenidoEspecial
      const token = jwt.sign(
        { 
          clienteId: cliente.id,
          cuil: cliente.cuit_dni,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          vendedorId: cliente.vendedor_id,
          isAdmin,
          Distribuidor: cliente.Distribuidor,
          contenidoEspecial: cliente.contenidoEspecial // ✅ NUEVO CAMPO
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
          razon_social: cliente.razon_social, 
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          email: cliente.email,
          telefono: cliente.telefono,
          vendedor_id: cliente.vendedor_id,
          isAdmin,
          Distribuidor: cliente.Distribuidor,
          contenidoEspecial: cliente.contenidoEspecial // ✅ NUEVO CAMPO
        }
      });
    }

    if (!auth.password_hash) {
      return NextResponse.json(
        { success: false, message: 'No tienes contraseña configurada. Puedes ingresar solo con tu CUIL.' },
        { status: 400 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, auth.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // ✅ Generar token JWT CON DISTRIBUIDOR
    const token = jwt.sign(
      { 
        clienteId: cliente.id,
        cuil: cliente.cuit_dni,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        vendedorId: cliente.vendedor_id,
        isAdmin,
        Distribuidor: cliente.Distribuidor,
        contenidoEspecial: cliente.contenidoEspecial // ✅ NUEVO CAMPO
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
        razon_social: cliente.razon_social,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono,
        vendedor_id: cliente.vendedor_id,
        isAdmin,
        Distribuidor: cliente.Distribuidor,
        contenidoEspecial: cliente.contenidoEspecial // ✅ NUEVO CAMPO
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