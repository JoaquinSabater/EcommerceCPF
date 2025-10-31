import { NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET() {
  try {
    // ✅ OPTIMIZADO: Consulta simple sin cálculos de stock
    const [rows]: any = await db.query(`
      SELECT DISTINCT 
        m.id,
        m.nombre
      FROM marcas m
      INNER JOIN articulos a ON m.id = a.marca_id
      INNER JOIN items i ON a.item_id = i.id
      WHERE i.disponible = 1
      ORDER BY m.nombre ASC
    `);

    return NextResponse.json({ 
      success: true,
      marcas: rows 
    });

  } catch (error) {
    console.error('Error al obtener marcas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener marcas' },
      { status: 500 }
    );
  }
}