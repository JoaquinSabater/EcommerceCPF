import { db } from "./mysql";
import { Articulo,categorias,ArticuloPedido,Pedido} from "@/types/types";
import { RowDataPacket } from "mysql2";

export async function getArticulosPorSubcategoria(subcategoriaId: number): Promise<Articulo[]> {
  const [rows]: any = await db.query(
    `
    SELECT a.codigo_interno, a.item_id, a.marca_id, a.modelo, a.code, a.precio_venta, a.ubicacion, a.stock_actual,
          i.nombre AS item_nombre,
          m.nombre AS marca_nombre
    FROM articulos a
    JOIN items i ON a.item_id = i.id
    LEFT JOIN marcas m ON a.marca_id = m.id
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

// Interfaces para pedidos preliminares
export interface PedidoPreliminar {
  id?: number;
  vendedor_id: number;
  cliente_id: number;
  fecha_creacion?: string;
  estado?: 'borrador' | 'enviado' | 'cancelado';
  categoria_principal_id?: number;
  observaciones_generales?: string;
  vendedor_nombre?: string;
}

export interface ItemCarrito {
  codigo_interno: string;
  modelo: string;
  cantidad: number;
  precio: number;
  item_nombre?: string;
}

// Crear pedido preliminar
export async function crearPedidoPreliminar(
  clienteId: number,
  vendedorId: number,
  itemsCarrito: ItemCarrito[],
  observaciones?: string
): Promise<number> {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Crear el pedido preliminar
    const [pedidoResult] = await connection.query(
      `INSERT INTO pedido_preliminar (cliente_id, vendedor_id, observaciones_generales) 
       VALUES (?, ?, ?)`,
      [clienteId, vendedorId, observaciones || null]
    );

    const pedidoPreliminarId = (pedidoResult as any).insertId;

    // 2. Insertar todos los detalles del pedido
    for (const item of itemsCarrito) {
      // Verificar que el artículo existe
      const [articuloExists] = await connection.query(
        'SELECT codigo_interno FROM articulos WHERE codigo_interno = ?',
        [item.codigo_interno]
      );

      if ((articuloExists as any).length === 0) {
        throw new Error(`Artículo con código ${item.codigo_interno} no encontrado`);
      }

      await connection.query(
        `INSERT INTO pedido_preliminar_detalle 
         (pedido_preliminar_id, articulo_codigo_interno, cantidad_solicitada, precio_unitario) 
         VALUES (?, ?, ?, ?)`,
        [pedidoPreliminarId, item.codigo_interno, item.cantidad, item.precio]
      );
    }

    await connection.commit();
    return pedidoPreliminarId;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Obtener pedidos preliminares por cliente
export async function getPedidosPreliminaresByCliente(clienteId: number): Promise<PedidoPreliminar[]> {
  const sql = `
    SELECT 
      pp.*,
      v.nombre AS vendedor_nombre
    FROM pedido_preliminar pp
    LEFT JOIN vendedores v ON pp.vendedor_id = v.id
    WHERE pp.cliente_id = ?
    ORDER BY pp.fecha_creacion DESC;
  `;

  const [rows] = await db.query<RowDataPacket[]>(sql, [clienteId]);
  return rows as PedidoPreliminar[];
}

// Obtener artículos de un pedido preliminar
export async function getArticulosDePedidoPreliminar(pedidoPreliminarId: number): Promise<ArticuloPedido[]> {
  const sql = `
    SELECT 
      i.nombre AS item_nombre,
      a.modelo,
      ppd.cantidad_solicitada as cantidad,
      ppd.precio_unitario,
      a.codigo_interno
    FROM pedido_preliminar_detalle ppd
    JOIN articulos a ON ppd.articulo_codigo_interno = a.codigo_interno
    JOIN items i ON a.item_id = i.id
    WHERE ppd.pedido_preliminar_id = ?
  `;
  
  const [rows] = await db.query<RowDataPacket[]>(sql, [pedidoPreliminarId]);
  return rows as ArticuloPedido[];
}
