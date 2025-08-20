import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: { rejectUnauthorized: false }
};

// GET - Obtener cards activas
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT id, titulo, subtitulo, imagen, enlace, orden, activo
      FROM cards_informativas 
      WHERE activo = TRUE 
      ORDER BY orden ASC
    `);
    
    await connection.end();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ error: 'Error al obtener cards' }, { status: 500 });
  }
}

// POST - Crear nueva card
export async function POST(request: NextRequest) {
  try {
    const { titulo, subtitulo, imagen, enlace, orden } = await request.json();
    
    if (!titulo || !subtitulo || !imagen) {
      return NextResponse.json({ error: 'Título, subtítulo e imagen son obligatorios' }, { status: 400 });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(`
      INSERT INTO cards_informativas (titulo, subtitulo, imagen, enlace, orden)
      VALUES (?, ?, ?, ?, ?)
    `, [titulo, subtitulo, imagen, enlace, orden || 0]);
    
    await connection.end();
    
    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: 'Error al crear card' }, { status: 500 });
  }
}