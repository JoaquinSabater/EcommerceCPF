import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { User} from '@/types/types';
import { verifyPassword } from '@/lib/bcrypt';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { cuil, password } = await request.json();

    if (!cuil) {
      return NextResponse.json(
        { success: false, message: 'CUIL es requerido' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.query('SET SESSION wait_timeout=300');
    await connection.query('SET SESSION interactive_timeout=300');

    // Buscar cliente
    const [clienteRows] = await connection.query(
      `SELECT id, nombre, apellido, email, telefono, domicilio, cuit_dni 
       FROM clientes WHERE cuit_dni = ?`,
      [cuil]
    );

    if ((clienteRows as any).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const cliente = (clienteRows as any)[0];
    const isAdmin = cliente.cuit_dni === 'Cellphonefree';

    // Buscar información de autenticación
    const [authRows] = await connection.query(
      `SELECT password_hash FROM clientes_auth WHERE cliente_id = ?`,
      [cliente.id]
    );

    const hasPassword = authRows && (authRows as any).length > 0 && (authRows as any)[0].password_hash;

    // Si no tiene contraseña configurada, permitir acceso solo con CUIL
    if (!hasPassword) {
      console.log(`✅ Login sin contraseña: ${cliente.nombre} ${cliente.apellido}`);
      
      const user: User = {
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono,
        domicilio: cliente.domicilio,
        cuil: cliente.cuit_dni,
        isAdmin,
        hasPassword: false
      };

      return NextResponse.json({
        success: true,
        user,
        requiresPasswordSetup: true
      });
    }

    // Si tiene contraseña, verificarla
    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Contraseña requerida' },
        { status: 400 }
      );
    }

    const isValidPassword = await verifyPassword(password, (authRows as any)[0].password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    console.log(`✅ Login con contraseña: ${cliente.nombre} ${cliente.apellido}`);

    const user: User = {
      id: cliente.id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      domicilio: cliente.domicilio,
      cuil: cliente.cuit_dni,
      isAdmin,
      hasPassword: true
    };

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}