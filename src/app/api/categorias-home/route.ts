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

import { getRateLimiter } from '@/lib/rate-limit';

// ✅ OPTIMIZADO: Cache ISR de 1 hora (categorías cambian poco)
export const revalidate = 3600;

// GET - Obtener categorías activas
export async function GET(request: NextRequest) {
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 10, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/categorias-home');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
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
  // 🔒 PROTECCIÓN: Solo administradores pueden crear categorías
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) return authResult;

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