import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: { rejectUnauthorized: false }
};

// GET - Obtener categorías activas
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT id, nombre, imagen, url, orden, activo
      FROM categorias_home 
      WHERE activo = TRUE 
      ORDER BY orden ASC
    `);
    
    await connection.end();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}

// POST - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const { nombre, imagen, url, orden } = await request.json();
    
    if (!nombre || !imagen || !url) {
      return NextResponse.json({ error: 'Nombre, imagen y URL son obligatorios' }, { status: 400 });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(`
      INSERT INTO categorias_home (nombre, imagen, url, orden)
      VALUES (?, ?, ?, ?)
    `, [nombre, imagen, url, orden || 0]);
    
    await connection.end();
    
    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 });
  }
}