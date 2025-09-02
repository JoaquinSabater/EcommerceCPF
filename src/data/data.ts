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
  const [rows]: any = await db.query(
    `
      SELECT * FROM items WHERE subcategoria_id = ?;
    `,
    [subcategoriaId]
  );
  return rows as categorias[];
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
  sugerencia?: string; // ✅ Agregar sugerencia a la interfaz
}

// ✅ Crear pedido preliminar con soporte para sugerencias (con manejo mejorado de conexiones)
export async function crearPedidoPreliminar(
  clienteId: number,
  vendedorId: number,
  itemsCarrito: ItemCarrito[],
  observaciones?: string
): Promise<number> {
  let connection;
  
  try {
    // ✅ Obtener nueva conexión con timeout
    connection = await db.getConnection();
    
    // ✅ Configurar timeout de conexión
    await connection.query('SET SESSION wait_timeout=300');
    await connection.query('SET SESSION interactive_timeout=300');
    
    await connection.beginTransaction();

    console.log('🟢 === INICIO DEBUG PEDIDO PRELIMINAR ===');
    console.log('Cliente ID:', clienteId);
    console.log('Vendedor ID:', vendedorId);
    console.log('Items carrito completo:', JSON.stringify(itemsCarrito, null, 2));

    // 1. Crear el pedido preliminar
    const [pedidoResult] = await connection.query(
      `INSERT INTO pedido_preliminar (cliente_id, vendedor_id, observaciones_generales) 
       VALUES (?, ?, ?)`,
      [clienteId, vendedorId, observaciones || null]
    );

    const pedidoPreliminarId = (pedidoResult as any).insertId;
    console.log('🟢 Pedido preliminar creado con ID:', pedidoPreliminarId);

    // 2. Insertar todos los detalles del pedido con sugerencias
    for (let i = 0; i < itemsCarrito.length; i++) {
      const item = itemsCarrito[i];
      console.log(`🟡 === PROCESANDO ITEM ${i + 1}/${itemsCarrito.length} ===`);
      console.log('Item completo:', JSON.stringify(item, null, 2));
      console.log('Codigo interno:', item.codigo_interno);
      console.log('Cantidad:', item.cantidad);
      console.log('Precio:', item.precio);
      console.log('Sugerencia existe?', !!item.sugerencia);
      console.log('Sugerencia valor:', item.sugerencia);
      console.log('Sugerencia después de trim:', item.sugerencia?.trim());

      // Verificar que el artículo existe
      const [articuloExists] = await connection.query(
        'SELECT codigo_interno FROM articulos WHERE codigo_interno = ?',
        [item.codigo_interno]
      );

      if ((articuloExists as any).length === 0) {
        throw new Error(`Artículo con código ${item.codigo_interno} no encontrado`);
      }

      console.log('🟢 Artículo existe en BD');

      // ✅ Insertar detalle del pedido
      const [detalleResult] = await connection.query(
        `INSERT INTO pedido_preliminar_detalle 
         (pedido_preliminar_id, articulo_codigo_interno, cantidad_solicitada, precio_unitario) 
         VALUES (?, ?, ?, ?)`,
        [pedidoPreliminarId, item.codigo_interno, item.cantidad, item.precio]
      );

      const detalleId = (detalleResult as any).insertId;
      console.log('🟢 Detalle creado con ID:', detalleId);

      // ✅ Verificar e insertar sugerencia
      const tieneSugerencia = item.sugerencia && item.sugerencia.trim() !== '';
      console.log('🟡 ¿Tiene sugerencia válida?', tieneSugerencia);

      if (tieneSugerencia) {
        const sugerenciaLimpia = item.sugerencia!.trim();
        console.log('🟡 Insertando sugerencia:', sugerenciaLimpia);
        console.log('🟡 Para detalle ID:', detalleId);
        
        try {
          const [sugerenciaResult] = await connection.query(
            `INSERT INTO pedido_preliminar_detalle_sugerencias 
             (pedido_preliminar_detalle_id, sugerencia) 
             VALUES (?, ?)`,
            [detalleId, sugerenciaLimpia]
          );
          
          console.log('🟢 Sugerencia insertada exitosamente. Insert ID:', (sugerenciaResult as any).insertId);
          
          // Verificar que se insertó correctamente
          const [verificacion] = await connection.query(
            'SELECT * FROM pedido_preliminar_detalle_sugerencias WHERE pedido_preliminar_detalle_id = ?',
            [detalleId]
          );
          console.log('🟢 Verificación de inserción:', verificacion);
          
        } catch (sugerenciaError) {
          console.error('🔴 Error específico al insertar sugerencia:', sugerenciaError);
          throw sugerenciaError;
        }
      } else {
        console.log('🟡 Sin sugerencia para este item - SALTANDO');
      }
    }

    await connection.commit();
    console.log('🟢 === TRANSACCIÓN COMPLETADA EXITOSAMENTE ===');
    return pedidoPreliminarId;

  } catch (error) {
    console.error('🔴 === ERROR EN TRANSACCIÓN ===');
    console.error('Error completo:', error);
    
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

// Obtener pedidos preliminares por cliente con manejo mejorado
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

// ✅ Obtener artículos de un pedido preliminar con sugerencias
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

// ✅ Nueva función para obtener sugerencias de un detalle específico
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

// ✅ Nueva función para agregar sugerencia a un detalle existente
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