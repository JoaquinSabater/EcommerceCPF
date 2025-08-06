import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/data/mysql";

export async function GET(request: NextRequest) {
  try {
    // Obtener el ID del producto de la URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Se requiere ID del producto" }, { status: 400 });
    }

    // Consulta para obtener los detalles del producto usando el mismo estilo que precio/route.ts
    const [rows]: any = await db.query(
      `SELECT d.*, i.nombre as item_nombre
       FROM item_detalle d
       JOIN items i ON d.item_id = i.id
       WHERE d.item_id = ?`,
      [id]
    );
    
    // Si no hay resultados, retornar error 404
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Devolver el primer resultado
    return NextResponse.json(rows[0]);
    
  } catch (error) {
    console.error('Error al obtener detalles del producto:', error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}