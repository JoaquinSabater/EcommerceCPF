import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: { rejectUnauthorized: false }
};

// PUT - Actualizar slide existente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { titulo, descripcion, imagen_desktop, imagen_mobile, enlace, orden, activo } = body;
    
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(`
      UPDATE home_carousel 
      SET titulo = ?, descripcion = ?, imagen_desktop = ?, imagen_mobile = ?, 
          enlace = ?, orden = ?, activo = ?
      WHERE id = ?
    `, [titulo, descripcion, imagen_desktop, imagen_mobile, enlace, orden, activo, params.id]);
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating carousel slide:', error);
    return NextResponse.json(
      { error: 'Error al actualizar slide del carousel' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute('DELETE FROM home_carousel WHERE id = ?', [params.id]);
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting carousel slide:', error);
    return NextResponse.json(
      { error: 'Error al eliminar slide del carousel' },
      { status: 500 }
    );
  }
}