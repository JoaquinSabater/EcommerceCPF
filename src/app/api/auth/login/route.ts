import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { User, LoginResponse } from '@/types/types'; // ← Importar los tipos



export async function POST(request: NextRequest) {
  try {
    const { cuil } = await request.json();

    if (!cuil) {
      return NextResponse.json(
        { message: 'CUIL es requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario por CUIL
    const [rows]: any = await db.query(
      'SELECT id, nombre, apellido, email, telefono, domicilio, cuit_dni FROM clientes WHERE cuit_dni = ?',
      [cuil]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const dbUser = rows[0];
    
    // Determinar si es admin
    const isAdmin = dbUser.cuit_dni === 'Cellphonefree';
    
    console.log(`✅ Usuario logueado: ${dbUser.nombre} ${dbUser.apellido} (CUIL: ${cuil}) ${isAdmin ? '- ADMIN' : '- CLIENTE'}`);

    // Crear objeto user tipado
    const user: User = {
      id: dbUser.id,
      nombre: dbUser.nombre,
      apellido: dbUser.apellido,
      email: dbUser.email,
      telefono: dbUser.telefono,
      domicilio: dbUser.domicilio,
      cuil: dbUser.cuit_dni,
      isAdmin: isAdmin // Incluir el campo isAdmin
    };

    // Respuesta tipada
    const response: LoginResponse = {
      success: true,
      user
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}