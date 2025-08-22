import { db } from "./mysql";
import { Articulo,categorias,ArticuloPedido,Pedido} from "@/types/types";
import { RowDataPacket } from "mysql2";

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

export async function getPedidosByCliente(clienteId: number): Promise<Pedido[]> {
  const sql = `
    SELECT 
      p.*,
      u1.username AS armador_nombre,
      u2.username AS controlador_nombre,
      v.nombre AS vendedor_nombre
    FROM pedidos p
    LEFT JOIN usuarios u1 ON p.armador_id = u1.id
    LEFT JOIN usuarios u2 ON p.controlador_id = u2.id
    LEFT JOIN vendedores v ON p.vendedor_id = v.id
    WHERE p.cliente_id = ?
    ORDER BY p.fecha_creacion DESC;
  `;

  const [rows] = await db.query<RowDataPacket[]>(sql, [clienteId]);
  return rows as Pedido[];
}

export async function getArticulosDePedido(pedidoId: number): Promise<ArticuloPedido[]> {
  const sql = `
    SELECT 
      i.nombre AS item_nombre,
      a.modelo,
      pd.cantidad_solicitada as cantidad
    FROM pedidos_detalle pd
    JOIN articulos a ON pd.articulo_codigo_interno = a.codigo_interno
    JOIN items i ON a.item_id = i.id
    WHERE pd.pedido_id = ?
  `;
  
  const [rows] = await db.query<RowDataPacket[]>(sql, [pedidoId]);
  return rows as ArticuloPedido[];
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