import { db } from '@/data/mysql';

export interface PromotionRow {
  id: number;
  nombre: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  descuento_percent: number;
  max_pedidos_por_cliente: number;
  activa: number;
  created_at?: string;
  updated_at?: string;
}

export async function getActivePromotion(): Promise<PromotionRow | null> {
  const [rows]: any = await db.query(
    `SELECT *
     FROM promociones
     WHERE activa = 1
       AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
     ORDER BY updated_at DESC
     LIMIT 1`
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0] as PromotionRow;
}

export async function getPromotionSingleton(): Promise<PromotionRow | null> {
  const [rows]: any = await db.query(
    `SELECT *
     FROM promociones
     ORDER BY id ASC
     LIMIT 1`
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0] as PromotionRow;
}

export interface PromotionPayload {
  nombre: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  descuento_percent: number;
  max_pedidos_por_cliente: number;
  activa: boolean;
}

export async function upsertPromotion(payload: PromotionPayload): Promise<PromotionRow> {
  const existing = await getPromotionSingleton();

  const descripcion = payload.descripcion ?? null;

  if (!existing) {
    const [result]: any = await db.query(
      `INSERT INTO promociones
        (nombre, descripcion, fecha_inicio, fecha_fin, descuento_percent, max_pedidos_por_cliente, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.nombre,
        descripcion,
        payload.fecha_inicio,
        payload.fecha_fin,
        payload.descuento_percent,
        payload.max_pedidos_por_cliente,
        payload.activa ? 1 : 0
      ]
    );

    const insertedId = result.insertId;
    const [rows]: any = await db.query('SELECT * FROM promociones WHERE id = ?', [insertedId]);
    return rows[0] as PromotionRow;
  }

  await db.query(
    `UPDATE promociones
     SET nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?,
         descuento_percent = ?, max_pedidos_por_cliente = ?, activa = ?
     WHERE id = ?`,
    [
      payload.nombre,
      descripcion,
      payload.fecha_inicio,
      payload.fecha_fin,
      payload.descuento_percent,
      payload.max_pedidos_por_cliente,
      payload.activa ? 1 : 0,
      existing.id
    ]
  );

  const updated = await getPromotionSingleton();
  if (!updated) {
    throw new Error('No se pudo actualizar la promoción');
  }
  return updated;
}

export async function resetPromotionCounters() {
  await db.query('UPDATE clientes_auth SET promocion_pedidos_count = 0');
}
