import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: { rejectUnauthorized: false }
};

// PUT - Actualizar card
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { titulo, subtitulo, imagen, enlace, orden, activo } = await request.json();
    
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(`
      UPDATE cards_informativas 
      SET titulo = ?, subtitulo = ?, imagen = ?, enlace = ?, orden = ?, activo = ?
      WHERE id = ?
    `, [titulo, subtitulo, imagen, enlace, orden, activo, params.id]);
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json({ error: 'Error al actualizar card' }, { status: 500 });
  }
}

// DELETE - Eliminar card
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute('DELETE FROM cards_informativas WHERE id = ?', [params.id]);
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json({ error: 'Error al eliminar card' }, { status: 500 });
  }
}