import { NextResponse } from "next/server";
import { db } from "@/data/mysql";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "itemId es requerido" }, { status: 400 });
  }

  try {
    const [rows]: any = await db.query(
      `SELECT precio_venta FROM articulos WHERE item_id = ? LIMIT 1`,
      [itemId]
    );
    
    if (rows.length > 0) {
      return NextResponse.json({ precio: rows[0].precio_venta });
    } else {
      return NextResponse.json({ precio: null });
    }
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener precio" }, { status: 500 });
  }
}