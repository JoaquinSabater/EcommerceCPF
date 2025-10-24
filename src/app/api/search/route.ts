import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    // ✅ Cambiar validación de 2 a 3 caracteres
    if (!query || query.trim().length < 3) {
      return NextResponse.json({ 
        success: false,
        message: 'Debe proporcionar al menos 3 caracteres para buscar',
        results: [] 
      });
    }

    const palabrasClave = query.trim().split(' ').filter(palabra => palabra.trim() !== '');
    
    if (palabrasClave.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Término de búsqueda inválido',
        results: []
      });
    }

    // ✅ Validar que cada palabra tenga al menos 2 caracteres
    const palabrasValidas = palabrasClave.filter(palabra => palabra.length >= 2);
    
    if (palabrasValidas.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Las palabras de búsqueda deben tener al menos 2 caracteres',
        results: []
      });
    }

    const condiciones: string[] = [];
    const parametros: string[] = [];

    palabrasValidas.forEach(palabra => {
      condiciones.push(`(
        a.codigo_interno LIKE ? OR 
        i.nombre LIKE ? OR 
        m.nombre LIKE ? OR 
        a.modelo LIKE ? OR
        d.descripcion LIKE ?
      )`);
      // ✅ NUEVO: Agregamos la descripción a los parámetros
      parametros.push(
        `%${palabra}%`, // codigo_interno
        `%${palabra}%`, // item nombre
        `%${palabra}%`, // marca nombre
        `%${palabra}%`, // modelo
        `%${palabra}%`  // descripcion (NUEVO)
      );
    });

    const whereClause = condiciones.join(' AND ');

    const sqlMain = `
      SELECT 
        a.codigo_interno,
        CONCAT(
          IFNULL(i.nombre, ''), ' ', 
          IFNULL(m.nombre, ''), ' ', 
          IFNULL(a.modelo, ''), ' ',
          IFNULL(d.descripcion, '')
        ) AS descripcion_completa,
        i.id as item_id,
        i.nombre AS item,
        a.modelo,
        m.nombre AS marca_nombre,
        a.precio_venta,
        calcular_stock_fisico(a.codigo_interno) - calcular_stock_comprometido(a.codigo_interno) AS stock_real,
        a.ubicacion,
        d.foto1_url,
        d.foto_portada,
        d.descripcion,
        CONCAT(m.nombre, ' ', a.modelo) AS marca_modelo_completo
      FROM articulos a
      INNER JOIN items i ON a.item_id = i.id
      INNER JOIN marcas m ON a.marca_id = m.id
      LEFT JOIN item_detalle d ON a.item_id = d.item_id
      WHERE ${whereClause} AND i.disponible = 1
      HAVING stock_real > 0
      ORDER BY 
        CASE 
          WHEN i.nombre LIKE ? THEN 1
          WHEN m.nombre LIKE ? THEN 2
          WHEN a.modelo LIKE ? THEN 3
          WHEN d.descripcion LIKE ? THEN 4
          ELSE 5
        END,
        i.nombre, m.nombre, a.modelo
      LIMIT 50
    `;

    // ✅ NUEVO: Agregar parámetros para el ORDER BY (priorizar resultados más relevantes)
    const primerapalabra = `%${palabrasValidas[0]}%`;
    const parametrosCompletos = [
      ...parametros,
      primerapalabra, // para ORDER BY - item nombre
      primerapalabra, // para ORDER BY - marca nombre  
      primerapalabra, // para ORDER BY - modelo
      primerapalabra  // para ORDER BY - descripcion
    ];

    const [rows]: any = await db.query(sqlMain, parametrosCompletos);

    return NextResponse.json({ 
      success: true,
      results: rows,
      query: query,
      total: rows.length,
      searchLength: query.length
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor', 
        message: 'Error al buscar artículos',
        results: [] 
      },
      { status: 500 }
    );
  }
}