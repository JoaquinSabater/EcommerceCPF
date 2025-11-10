import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key';

// ✅ NUEVA FUNCIÓN: Verificar si el usuario tiene contenido especial
async function verificarContenidoEspecial(request: NextRequest): Promise<boolean> {
  try {
    // Obtener token de las cookies
    const authToken = request.cookies.get('auth_token')?.value;
    const authUser = request.cookies.get('auth_user')?.value;
    
    if (!authUser) {
      return false;
    }
    
    const userData = JSON.parse(decodeURIComponent(authUser));
    return userData.contenidoEspecial === 1;
    
  } catch (error) {
    console.error('Error verificando contenido especial:', error);
    return false;
  }
}

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

    // ✅ VERIFICAR ACCESO A CONTENIDO ESPECIAL
    const tieneContenidoEspecial = await verificarContenidoEspecial(request);
    console.log(`🔒 Usuario tiene contenido especial: ${tieneContenidoEspecial}`);

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
      parametros.push(
        `%${palabra}%`,  // codigo_interno
        `%${palabra}%`,  // item nombre
        `%${palabra}%`,  // marca nombre  
        `%${palabra}%`,  // modelo
        `%${palabra}%`   // descripcion
      );
    });

    const whereClause = condiciones.join(' AND ');

    // ✅ AGREGAR FILTRO DE CONTENIDO ESPECIAL
    const filtroContenidoEspecial = tieneContenidoEspecial 
      ? '' // Si tiene acceso, mostrar todos los items
      : 'AND (d.contenido_especial = 0 OR d.contenido_especial IS NULL)'; // Si no tiene acceso, solo items normales

    // ✅ QUERY MODIFICADA con filtro de contenido especial
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
        d.contenido_especial,
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
      ${filtroContenidoEspecial}
      HAVING stock_real > 0
      ORDER BY 
        CASE
          WHEN CONCAT(m.nombre, ' ', a.modelo) LIKE ? THEN 1
          WHEN ${palabras.map(() => `CONCAT(m.nombre, ' ', a.modelo) LIKE ?`).join(' AND ')} THEN 2
          WHEN a.modelo LIKE ? THEN 3
          WHEN CONCAT(m.nombre, ' ', a.modelo) LIKE ? THEN 4
          WHEN i.nombre LIKE ? THEN 5
          WHEN m.nombre LIKE ? THEN 6
          ELSE 7
        END,
        m.nombre, a.modelo, i.nombre
      LIMIT 70
    `;

    // ✅ Parámetros para ORDER BY (sin cambios)
    const terminoCompleto = termino.trim();
    parametros.push(`%${terminoCompleto}%`);
    
    palabras.forEach(palabra => {
      parametros.push(`%${palabra}%`);
    });
    
    const ultimaPalabra = palabras[palabras.length - 1];
    parametros.push(`%${ultimaPalabra}%`);
    
    const primeraPalabra = palabras[0];
    parametros.push(`%${primeraPalabra}%`);
    
    parametros.push(`%${terminoCompleto}%`);
    parametros.push(`%${primeraPalabra}%`);

    console.log(`🔍 Ejecutando consulta con ${parametros.length} parámetros`);
    console.log(`🔒 Filtro contenido especial aplicado: ${!tieneContenidoEspecial ? 'SÍ' : 'NO'}`);

    const [rows]: any = await db.query(sqlFinal, parametros);

    console.log(`✅ Resultados encontrados: ${rows.length}`);
    
    // ✅ LOG mejorado con info de contenido especial
    if (rows.length > 0) {
      console.log('📦 Primeros resultados (ordenados por relevancia):');
      rows.slice(0, 8).forEach((row: any, index: number) => {
        const marcaModelo = `${row.marca_nombre} ${row.modelo}`;
        const esEspecial = row.contenido_especial === 1;
        const coincideExacto = marcaModelo.toLowerCase().includes(terminoCompleto.toLowerCase());
        console.log(`   ${index + 1}. [${marcaModelo}] ${row.item} ${coincideExacto ? '🎯' : ''} ${esEspecial ? '🔒' : ''}`);
      });
    }

    return NextResponse.json({ 
      success: true,
      results: rows,
      query: termino,
      total: rows.length,
      debug: {
        palabrasBuscadas: palabras,
        terminoCompleto,
        tieneContenidoEspecial,
        filtroAplicado: !tieneContenidoEspecial,
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