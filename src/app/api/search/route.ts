import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ 
        success: false,
        message: 'Debe proporcionar al menos 3 caracteres para buscar',
        results: [] 
      });
    }

    const termino = query.trim().toLowerCase();
    console.log(`🔍 API Search - Término recibido: "${termino}"`);

    // ✅ DETECTAR SI ES BÚSQUEDA DE MODELO ESPECÍFICO (ej: "iphone 13")
    const esModeloEspecifico = /\b(iphone|samsung|motorola|xiaomi|huawei|lg|nokia)\s+\d+/i.test(termino);
    
    let sqlFinal = '';
    let parametros: string[] = [];

    if (esModeloEspecifico) {
      console.log('🎯 Búsqueda de modelo específico detectada');
      
      // ✅ BÚSQUEDA ESPECÍFICA PARA MODELOS (más restrictiva)
      sqlFinal = `
        SELECT DISTINCT
          a.codigo_interno,
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
        WHERE i.disponible = 1
        AND (
          -- ✅ Buscar SOLO en modelo y marca (no en nombre del item)
          CONCAT(m.nombre, ' ', a.modelo) LIKE ?
          OR a.modelo LIKE ?
          OR (m.nombre LIKE ? AND a.modelo LIKE ?)
        )
        HAVING stock_real > 0
        ORDER BY 
          -- ✅ Priorizar coincidencias exactas en modelo
          CASE 
            WHEN CONCAT(m.nombre, ' ', a.modelo) LIKE ? THEN 1
            WHEN a.modelo LIKE ? THEN 2
            ELSE 3
          END,
          m.nombre, a.modelo
        LIMIT 70
      `;

      // ✅ Extraer marca y modelo si es posible
      const palabras = termino.split(' ').filter(p => p.trim().length >= 2);
      const posibleMarca = palabras[0] || '';
      const posibleModelo = palabras.slice(1).join(' ') || '';

      parametros = [
        `%${termino}%`,           // Para CONCAT(marca, modelo)
        `%${termino}%`,           // Para modelo
        `%${posibleMarca}%`,      // Para marca específica
        `%${posibleModelo}%`,     // Para modelo específico
        `%${termino}%`,           // Para ORDER BY - coincidencia exacta
        `%${termino}%`            // Para ORDER BY - modelo
      ];

      console.log(`🔍 Marca detectada: "${posibleMarca}", Modelo: "${posibleModelo}"`);

    } else {
      console.log('🔍 Búsqueda general');
      
      // ✅ BÚSQUEDA GENERAL (como antes, pero mejorada)
      const palabras = termino.split(' ').filter(p => p.trim().length >= 2);
      
      if (palabras.length > 1) {
        // ✅ Búsqueda con múltiples palabras - MÁS ESPECÍFICA
        const condicionesPalabras = palabras.map(() => `
          (CONCAT(m.nombre, ' ', a.modelo, ' ', IFNULL(d.descripcion, '')) LIKE ?)
        `).join(' AND ');

        sqlFinal = `
          SELECT DISTINCT
            a.codigo_interno,
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
          WHERE i.disponible = 1
          AND (
            -- ✅ Prioridad a marca+modelo, luego descripción, EVITAR nombre de item genérico
            (CONCAT(m.nombre, ' ', a.modelo) LIKE ? AND ${condicionesPalabras})
            OR (${condicionesPalabras})
          )
          HAVING stock_real > 0
          ORDER BY 
            CASE 
              WHEN CONCAT(m.nombre, ' ', a.modelo) LIKE ? THEN 1
              WHEN d.descripcion LIKE ? THEN 2
              ELSE 3
            END,
            m.nombre, a.modelo
          LIMIT 70
        `;

        parametros = [
          `%${termino}%`,                    // Para CONCAT en prioridad alta
          ...palabras.map(p => `%${p}%`),    // Para condiciones de palabras (prioridad alta)
          ...palabras.map(p => `%${p}%`),    // Para condiciones de palabras (general)
          `%${termino}%`,                    // Para ORDER BY - marca+modelo
          `%${termino}%`                     // Para ORDER BY - descripción
        ];

      } else {
        // ✅ Búsqueda de una sola palabra
        sqlFinal = `
          SELECT DISTINCT
            a.codigo_interno,
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
          WHERE i.disponible = 1
          AND (
            m.nombre LIKE ? OR 
            a.modelo LIKE ? OR
            d.descripcion LIKE ? OR
            i.nombre LIKE ?
          )
          HAVING stock_real > 0
          ORDER BY 
            CASE 
              WHEN m.nombre LIKE ? THEN 1
              WHEN a.modelo LIKE ? THEN 2
              WHEN d.descripcion LIKE ? THEN 3
              WHEN i.nombre LIKE ? THEN 4
              ELSE 5
            END,
            m.nombre, a.modelo
          LIMIT 70
        `;

        parametros = [
          `%${termino}%`, `%${termino}%`, `%${termino}%`, `%${termino}%`, // WHERE
          `%${termino}%`, `%${termino}%`, `%${termino}%`, `%${termino}%`  // ORDER BY
        ];
      }
    }

    console.log(`🔍 Ejecutando consulta con ${parametros.length} parámetros`);
    console.log(`📝 Tipo de búsqueda: ${esModeloEspecifico ? 'Modelo específico' : 'General'}`);

    const [rows]: any = await db.query(sqlFinal, parametros);

    console.log(`✅ Resultados encontrados: ${rows.length}`);
    
    // ✅ LOG de los primeros resultados para debug
    rows.slice(0, 5).forEach((row: any, index: number) => {
      console.log(`📦 ${index + 1}. ${row.marca_nombre} ${row.modelo} - ${row.item}`);
    });

    return NextResponse.json({ 
      success: true,
      results: rows,
      query: termino,
      total: rows.length,
      searchType: esModeloEspecifico ? 'modelo_especifico' : 'general',
      debug: {
        terminoOriginal: termino,
        esModeloEspecifico,
        totalParametros: parametros.length
      }
    });

  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
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