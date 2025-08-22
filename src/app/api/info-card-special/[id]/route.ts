import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: { rejectUnauthorized: false }
};

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { titulo, subtitulo, imagen, enlace, precio_destacado, orden, activo } = await request.json();
    const params = await context.params;
    
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(`
      UPDATE info_card_special 
      SET titulo = ?, subtitulo = ?, imagen = ?, enlace = ?, precio_destacado = ?, orden = ?, activo = ?
      WHERE id = ?
    `, [titulo, subtitulo, imagen, enlace, precio_destacado, orden, activo, params.id]);
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating info card special:', error);
    return NextResponse.json({ error: 'Error al actualizar card' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const params = await context.params;
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute('DELETE FROM info_card_special WHERE id = ?', [params.id]);
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting info card special:', error);
    return NextResponse.json({ error: 'Error al eliminar card' }, { status: 500 });
  }
}