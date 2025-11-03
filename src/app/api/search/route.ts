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

    const termino = query.trim();
    console.log(`🔍 API Search - Término recibido: "${termino}"`);

    // ✅ NUEVA LÓGICA: Similar al PHP - dividir en palabras y buscar TODAS
    const palabras = termino.split(' ').filter(palabra => palabra.trim().length > 0);
    console.log(`📝 Palabras a buscar: [${palabras.join(', ')}]`);

    if (palabras.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Término de búsqueda inválido',
        results: [] 
      });
    }

    // ✅ CREAR CONDICIONES: Cada palabra debe estar en algún campo
    const condiciones: any[] = [];
    const parametros = [];

    palabras.forEach(palabra => {
      condiciones.push(`(
        a.codigo_interno LIKE ? OR 
        i.nombre LIKE ? OR 
        m.nombre LIKE ? OR 
        a.modelo LIKE ? OR
        d.descripcion LIKE ?
      )`);
      // Cada palabra se busca en 5 campos
      parametros.push(
        `%${palabra}%`,  // codigo_interno
        `%${palabra}%`,  // item nombre
        `%${palabra}%`,  // marca nombre  
        `%${palabra}%`,  // modelo
        `%${palabra}%`   // descripcion
      );
    });

    const whereClause = condiciones.join(' AND ');

    // ✅ QUERY SIMPLIFICADA pero con todos los datos necesarios
    const sqlFinal = `
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
        CONCAT(m.nombre, ' ', a.modelo) AS marca_modelo_completo,
        a.item_id,
        a.marca_id,
        i.disponible
      FROM articulos a
      INNER JOIN items i ON a.item_id = i.id
      INNER JOIN marcas m ON a.marca_id = m.id
      LEFT JOIN item_detalle d ON a.item_id = d.item_id
      WHERE i.disponible = 1
      AND (${whereClause})
      HAVING stock_real > 0
      ORDER BY 
        -- ✅ ORDEN MEJORADO: Priorizar coincidencias exactas
        CASE
          -- 🥇 PRIORIDAD 1: Coincidencia EXACTA en marca + modelo
          WHEN CONCAT(m.nombre, ' ', a.modelo) LIKE ? THEN 1
          
          -- 🥈 PRIORIDAD 2: Todas las palabras están en marca + modelo
          WHEN ${palabras.map(() => `CONCAT(m.nombre, ' ', a.modelo) LIKE ?`).join(' AND ')} THEN 2
          
          -- 🥉 PRIORIDAD 3: Coincidencia exacta solo en modelo
          WHEN a.modelo LIKE ? THEN 3
          
          -- 🏅 PRIORIDAD 4: Coincidencia parcial en marca + modelo
          WHEN CONCAT(m.nombre, ' ', a.modelo) LIKE ? THEN 4
          
          -- 🏅 PRIORIDAD 5: Coincidencia en nombre del item
          WHEN i.nombre LIKE ? THEN 5
          
          -- 🏅 PRIORIDAD 6: Solo marca
          WHEN m.nombre LIKE ? THEN 6
          
          ELSE 7
        END,
        -- ✅ Orden secundario: Por marca y modelo alfabéticamente
        m.nombre, a.modelo, i.nombre
      LIMIT 70
    `;

    // ✅ Parámetros para ORDER BY con lógica inteligente
    const terminoCompleto = termino.trim();
    
    // Para coincidencia exacta completa
    parametros.push(`%${terminoCompleto}%`);
    
    // Para que todas las palabras estén en marca+modelo
    palabras.forEach(palabra => {
      parametros.push(`%${palabra}%`);
    });
    
    // Para coincidencia exacta en modelo (última palabra generalmente es el modelo)
    const ultimaPalabra = palabras[palabras.length - 1];
    parametros.push(`%${ultimaPalabra}%`);
    
    // Para coincidencia parcial en marca+modelo (primera palabra)
    const primeraPalabra = palabras[0];
    parametros.push(`%${primeraPalabra}%`);
    
    // Para item, marca individual
    parametros.push(`%${terminoCompleto}%`); // item
    parametros.push(`%${primeraPalabra}%`);  // marca

    console.log(`🔍 Ejecutando consulta con ${parametros.length} parámetros`);
    console.log(`📝 Condiciones: ${condiciones.length} (una por palabra)`);
    console.log(`🎯 Término completo: "${terminoCompleto}"`);
    console.log(`🎯 Primera palabra: "${primeraPalabra}", Última palabra: "${ultimaPalabra}"`);

    const [rows]: any = await db.query(sqlFinal, parametros);

    console.log(`✅ Resultados encontrados: ${rows.length}`);
    
    // ✅ LOG de debugging mejorado con orden
    if (rows.length > 0) {
      console.log('📦 Primeros resultados (ordenados por relevancia):');
      rows.slice(0, 8).forEach((row: any, index: number) => {
        const marcaModelo = `${row.marca_nombre} ${row.modelo}`;
        const coincideExacto = marcaModelo.toLowerCase().includes(terminoCompleto.toLowerCase());
        console.log(`   ${index + 1}. [${marcaModelo}] ${row.item} ${coincideExacto ? '🎯' : ''}`);
      });
    } else {
      console.log('❌ No se encontraron resultados');
      console.log('🔍 Se buscaron las palabras:', palabras);
    }

    return NextResponse.json({ 
      success: true,
      results: rows,
      query: termino,
      total: rows.length,
      debug: {
        palabrasBuscadas: palabras,
        terminoCompleto,
        primeraPalabra,
        ultimaPalabra,
        condicionesGeneradas: condiciones.length,
        parametrosEnviados: parametros.length
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