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

// GET - Obtener slides del carousel (máximo 4)
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT id, titulo, descripcion, imagen_desktop, imagen_mobile, enlace, orden, activo 
      FROM home_carousel 
      WHERE activo = true 
      ORDER BY orden ASC, id ASC
      LIMIT 4
    `);
    
    await connection.end();
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    return NextResponse.json(
      { error: 'Error al obtener slides del carousel' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva slide (solo admin, máximo 4)
export async function POST(request: NextRequest) {
  // 🔒 PROTECCIÓN: Solo administradores pueden crear slides
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const { titulo, descripcion, imagen_desktop, imagen_mobile, enlace, orden } = body;
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM home_carousel WHERE activo = true'
    );
    
    const currentCount = (countResult as any)[0].total;
    
    if (currentCount >= 4) {
      await connection.end();
      return NextResponse.json(
        { error: 'Máximo 4 slides permitidas en el carousel' },
        { status: 400 }
      );
    }
    
    const [result] = await connection.execute(`
      INSERT INTO home_carousel (titulo, descripcion, imagen_desktop, imagen_mobile, enlace, orden, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [titulo, descripcion, imagen_desktop, imagen_mobile, enlace, orden || (currentCount + 1), true]);
    
    await connection.end();
    
    return NextResponse.json({ 
      success: true, 
      id: (result as any).insertId 
    });
  } catch (error) {
    console.error('Error creating carousel slide:', error);
    return NextResponse.json(
      { error: 'Error al crear slide del carousel' },
      { status: 500 }
    );
  }
}