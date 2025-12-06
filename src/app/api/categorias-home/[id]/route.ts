import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { requireAdmin } from '@/lib/auth';

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

// PUT - Actualizar categoría
export async function PUT(request: NextRequest, context: RouteParams) {
  // 🔒 PROTECCIÓN: Solo administradores pueden editar categorías
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { nombre, imagen, url, orden, activo } = await request.json();
    const params = await context.params;
    
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(`
      UPDATE categorias_home 
      SET nombre = ?, imagen = ?, url = ?, orden = ?, activo = ?
      WHERE id = ?
    `, [nombre, imagen, url, orden, activo, params.id]);
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}

// DELETE - Eliminar categoría
export async function DELETE(request: NextRequest, context: RouteParams) {
  // 🔒 PROTECCIÓN: Solo administradores pueden eliminar categorías
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const params = await context.params;
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute('DELETE FROM categorias_home WHERE id = ?', [params.id]);
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 });
  }
}