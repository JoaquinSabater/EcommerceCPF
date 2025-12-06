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

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT id, titulo, subtitulo, imagen, enlace, precio_destacado, orden, activo
      FROM info_card_special 
      WHERE activo = TRUE 
      ORDER BY orden ASC
    `);
    
    await connection.end();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching info card special:', error);
    return NextResponse.json({ error: 'Error al obtener cards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // 🔒 PROTECCIÓN: Solo administradores pueden crear cards especiales
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { titulo, subtitulo, imagen, enlace, precio_destacado, orden } = await request.json();
    
    if (!titulo || !subtitulo || !imagen || !enlace || !precio_destacado) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(`
      INSERT INTO info_card_special (titulo, subtitulo, imagen, enlace, precio_destacado, orden)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [titulo, subtitulo, imagen, enlace, precio_destacado, orden || 0]);
    
    await connection.end();
    
    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error('Error creating info card special:', error);
    return NextResponse.json({ error: 'Error al crear card' }, { status: 500 });
  }
}