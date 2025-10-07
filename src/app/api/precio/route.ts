import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { getDolar } from '@/data/data';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'itemId es requerido' }, { status: 400 });
    }

    const [rows]: any = await db.query(
      `SELECT AVG(precio_venta) as precio_promedio_usd
       FROM articulos 
       WHERE item_id = ? AND ubicacion <> 'SIN STOCK'`,
      [itemId]
    );

    const precioPromedioDolares = rows[0]?.precio_promedio_usd || 0;

    const dolar = await getDolar();

    const precioEnPesos = precioPromedioDolares * dolar;

    return NextResponse.json({ 
      precio: Math.round(precioEnPesos),
      precioUsd: precioPromedioDolares,
      dolar: dolar
    });

  } catch (error) {
    console.error('Error al obtener precio:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}