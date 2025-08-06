import { db } from "./mysql";
import { Articulo,categorias } from "@/types/types";

export async function getArticulosPorSubcategoria(subcategoriaId: number): Promise<Articulo[]> {
  const [rows]: any = await db.query(
    `
    SELECT a.codigo_interno, a.item_id, a.marca_id, a.modelo, a.code, a.precio_venta, a.ubicacion, a.stock_actual,
          i.nombre AS item_nombre
    FROM articulos a
    JOIN items i ON a.item_id = i.id
    WHERE a.item_id = ? AND a.ubicacion <> 'SIN STOCK'
    `,
    [subcategoriaId]
  );
  return rows as Articulo[];
}

export async function getCategorias(subcategoriaId: number): Promise<categorias[]> {
  const [rows]: any = await db.query(
    `
      SELECT * FROM items WHERE subcategoria_id = ?;
    `,
    [subcategoriaId]
  );
  return rows as categorias[];
}

export async function getDolar(): Promise<number> {
  const dolar = process.env.DOLAR;
  return dolar ? parseFloat(dolar) : 1;
}
