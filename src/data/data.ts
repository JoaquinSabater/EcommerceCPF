import { db } from "./mysql";
import { Articulo,categorias,ArticuloPedido,Pedido} from "@/types/types";
import { RowDataPacket } from "mysql2";

export async function getArticulosPorSubcategoria(subcategoriaId: number): Promise<Articulo[]> {
  let connection;
  try {
    connection = await db.getConnection();
    
    const [rows] = await connection.query(
      `SELECT a.codigo_interno, a.item_id, a.marca_id, a.modelo, a.code, 
              COALESCE(a.precio_venta, 0) as precio_venta, a.ubicacion, a.stock_actual,
              calcular_stock_fisico(a.codigo_interno) - calcular_stock_comprometido(a.codigo_interno) AS stock_real,
              i.nombre AS item_nombre,
              m.nombre AS marca_nombre
      FROM articulos a
      JOIN items i ON a.item_id = i.id
      LEFT JOIN marcas m ON a.marca_id = m.id
      WHERE a.item_id = ? AND a.ubicacion <> 'SIN STOCK'
      HAVING stock_real > 0
      ORDER BY a.precio_venta ASC, a.modelo ASC`,
      [subcategoriaId]
    );
    
    return rows as Articulo[];
  } catch (error) {
    console.error('Error en getArticulosPorSubcategoria:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('🔴 Error al liberar conexión en getArticulosPorSubcategoria:', releaseError);
      }
    }
  }
}

export interface ItemAdmin {
  id: number;
  nombre: string;
  subcategoria_id: number;
  disponible: boolean | null;
  subcategoria_nombre?: string;
  total_articulos?: number;
}

export async function getAllItems(): Promise<ItemAdmin[]> {
  let connection;
  try {
    connection = await db.getConnection();
    
    const sql = `
      SELECT 
        i.id,
        i.nombre,
        i.subcategoria_id,
        i.disponible,
        s.nombre AS subcategoria_nombre,
        COUNT(a.codigo_interno) AS total_articulos
      FROM items i
      LEFT JOIN subcategorias s ON i.subcategoria_id = s.id
      LEFT JOIN articulos a ON i.id = a.item_id
      GROUP BY i.id, i.nombre, i.subcategoria_id, i.disponible, s.nombre
      ORDER BY s.nombre ASC, i.nombre ASC
    `;

    const [rows] = await connection.query<RowDataPacket[]>(sql);
    
    // ✅ CONVERTIR VALORES DE MySQL A BOOLEAN
    const items = rows.map(row => ({
      ...row,
      // Convertir disponible: 1 -> true, 0 -> false, null -> false
      disponible: row.disponible === 1 ? true : row.disponible === 0 ? false : false
    })) as ItemAdmin[];

    console.log('📊 Items cargados desde BD:', items.length);
    console.log('🔍 Primeros 3 items disponibilidad:', items.slice(0, 3).map(i => ({
      id: i.id,
      nombre: i.nombre,
      disponible_raw: rows.find(r => r.id === i.id)?.disponible,
      disponible_converted: i.disponible
    })));

    return items;
  } catch (error) {
    console.error('Error en getAllItems:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function updateItemDisponible(itemId: number, disponible: boolean | null): Promise<void> {
  let connection;
  try {
    connection = await db.getConnection();
    
    const mysqlValue = disponible === true ? 1 : disponible === false ? 0 : null;
    
    const sql = `UPDATE items SET disponible = ? WHERE id = ?`;
    const [result] = await connection.query(sql, [mysqlValue, itemId]);
    
    console.log(`✅ Item ${itemId} actualizado: disponible = ${disponible} (MySQL: ${mysqlValue})`);
    console.log('📊 Resultado de la actualización:', result);
  } catch (error) {
    console.error('Error en updateItemDisponible:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function getSubcategorias(): Promise<{id: number, nombre: string}[]> {
  let connection;
  try {
    connection = await db.getConnection();
    
    const sql = `SELECT id, nombre FROM subcategorias ORDER BY nombre ASC`;
    const [rows] = await connection.query<RowDataPacket[]>(sql);
    return rows as {id: number, nombre: string}[];
  } catch (error) {
    console.error('Error en getSubcategorias:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function getPedidosByCliente(clienteId: number): Promise<Pedido[]> {
  let connection;
  try {
    connection = await db.getConnection();
    
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

    const [rows] = await connection.query<RowDataPacket[]>(sql, [clienteId]);
    return rows as Pedido[];
  } catch (error) {
    console.error('Error en getPedidosByCliente:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
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
  let connection;
  try {
    connection = await db.getConnection();
    
    const [rows] = await connection.query(
      `SELECT DISTINCT i.* 
       FROM items i
       INNER JOIN articulos a ON i.id = a.item_id
       WHERE i.subcategoria_id = ? 
         AND i.disponible = 1 
         AND (calcular_stock_fisico(a.codigo_interno) - calcular_stock_comprometido(a.codigo_interno)) > 0
       ORDER BY i.nombre ASC`,
      [subcategoriaId]
    );
    
    return rows as categorias[];
  } catch (error) {
    console.error('Error en getCategorias:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('🔴 Error al liberar conexión en getCategorias:', releaseError);
      }
    }
  }
}

export async function getDolar(): Promise<number> {
  const [rows]: any = await db.query(
    `SELECT valor 
     FROM cotizaciones 
     ORDER BY fecha_creacion DESC 
     LIMIT 1`
  );

  return parseInt(rows[0].valor);
}

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
  sugerencia?: string;
}

export async function crearPedidoPreliminar(
  clienteId: number,
  itemsCarrito: any[],
  observaciones?: string
): Promise<number> {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    console.log('🟡 === CREANDO PEDIDO PRELIMINAR DE CLIENTE ===');
    console.log('Cliente ID:', clienteId);
    console.log('Items:', itemsCarrito.length);

    const [clienteData] = await connection.query(
      'SELECT vendedor_id FROM clientes WHERE id = ?',
      [clienteId]
    );

    if ((clienteData as any[]).length === 0) {
      throw new Error('Cliente no encontrado');
    }

    const vendedorId = (clienteData as any[])[0].vendedor_id;

    const [pedidoResult] = await connection.query(
      `INSERT INTO pedido_preliminar 
       (cliente_id, vendedor_id, prospecto_id, observaciones_generales) 
       VALUES (?, ?, NULL, ?)`,
      [clienteId, vendedorId, observaciones || 'Pedido desde carrito']
    );

    const pedidoPreliminarId = (pedidoResult as any).insertId;
    console.log('🟢 Pedido preliminar creado con ID:', pedidoPreliminarId);
    console.log('🟢 Cliente ID:', clienteId, '| Vendedor ID:', vendedorId, '| Prospecto ID: NULL');

    for (const item of itemsCarrito) {
      const [articuloExists] = await connection.query(
        'SELECT codigo_interno FROM articulos WHERE codigo_interno = ?',
        [item.codigo_interno]
      );

      if ((articuloExists as any).length === 0) {
        throw new Error(`Artículo con código ${item.codigo_interno} no encontrado`);
      }

      const [detalleResult] = await connection.query(
        `INSERT INTO pedido_preliminar_detalle 
         (pedido_preliminar_id, articulo_codigo_interno, cantidad_solicitada, precio_unitario) 
         VALUES (?, ?, ?, ?)`,
        [pedidoPreliminarId, item.codigo_interno, item.cantidad, item.precio]
      );

      const detalleId = (detalleResult as any).insertId;

      if (item.sugerencia && item.sugerencia.trim() !== '') {
        await connection.query(
          `INSERT INTO pedido_preliminar_detalle_sugerencias 
           (pedido_preliminar_detalle_id, sugerencia) 
           VALUES (?, ?)`,
          [detalleId, item.sugerencia.trim()]
        );
      }
    }

    await connection.commit();
    console.log('🟢 === PEDIDO DE CLIENTE CREADO EXITOSAMENTE ===');

    return pedidoPreliminarId;

  } catch (error) {
    console.error('🔴 Error creando pedido preliminar:', error);
    
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('🔴 Error en rollback:', rollbackError);
      }
    }
    
    throw error;
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('🔴 Error al liberar conexión:', releaseError);
      }
    }
  }
}

export async function getPedidosPreliminaresByCliente(clienteId: number): Promise<PedidoPreliminar[]> {
  let connection;
  try {
    connection = await db.getConnection();
    
    const sql = `
      SELECT 
        pp.*,
        v.nombre AS vendedor_nombre
      FROM pedido_preliminar pp
      LEFT JOIN vendedores v ON pp.vendedor_id = v.id
      WHERE pp.cliente_id = ?
      ORDER BY pp.fecha_creacion DESC;
    `;

    const [rows] = await connection.query<RowDataPacket[]>(sql, [clienteId]);
    return rows as PedidoPreliminar[];
  } catch (error) {
    console.error('Error en getPedidosPreliminaresByCliente:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function getArticulosDePedidoPreliminar(pedidoPreliminarId: number): Promise<ArticuloPedido[]> {
  const sql = `
    SELECT 
      i.nombre AS item_nombre,
      a.modelo,
      ppd.cantidad_solicitada as cantidad,
      ppd.precio_unitario,
      a.codigo_interno,
      ppds.sugerencia
    FROM pedido_preliminar_detalle ppd
    JOIN articulos a ON ppd.articulo_codigo_interno = a.codigo_interno
    JOIN items i ON a.item_id = i.id
    LEFT JOIN pedido_preliminar_detalle_sugerencias ppds ON ppd.id = ppds.pedido_preliminar_detalle_id
    WHERE ppd.pedido_preliminar_id = ?
  `;
  
  const [rows] = await db.query<RowDataPacket[]>(sql, [pedidoPreliminarId]);
  return rows as ArticuloPedido[];
}

export async function getSugerenciasPorDetalle(detalleId: number): Promise<string[]> {
  const sql = `
    SELECT sugerencia
    FROM pedido_preliminar_detalle_sugerencias
    WHERE pedido_preliminar_detalle_id = ?
    ORDER BY fecha_creacion ASC
  `;
  
  const [rows] = await db.query<RowDataPacket[]>(sql, [detalleId]);
  return rows.map((row: any) => row.sugerencia);
}

export async function agregarSugerenciaADetalle(detalleId: number, sugerencia: string): Promise<void> {
  if (!sugerencia || sugerencia.trim() === '') {
    throw new Error('La sugerencia no puede estar vacía');
  }

  const connection = await db.getConnection();
  
  try {
    await connection.query(
      `INSERT INTO pedido_preliminar_detalle_sugerencias 
       (pedido_preliminar_detalle_id, sugerencia) 
       VALUES (?, ?)`,
      [detalleId, sugerencia.trim()]
    );
  } finally {
    connection.release();
  }
}