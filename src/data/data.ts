import { db } from "./mysql";
import { Articulo } from "@/types/types";

export async function getArticulosPorPadreConStock(padre: string): Promise<Articulo[]> {
  const [rows]: any = await db.query(
    `
    SELECT a.codigo_interno, a.item_id, a.marca_id, a.modelo, a.code, a.precio_venta, a.ubicacion, a.stock_actual,
           i.nombre AS item_nombre
    FROM articulos a
    JOIN items i ON a.item_id = i.id
    WHERE i.padre = ? AND a.ubicacion <> 'SIN STOCK'
    `,
    [padre]
  );
  return rows as Articulo[];
}

export async function getDolar(): Promise<number> {
  const dolar = process.env.DOLAR;
  return dolar ? parseFloat(dolar) : 1;
}
