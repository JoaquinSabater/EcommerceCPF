import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { getRateLimiter } from '@/lib/rate-limit';

// ✅ NUEVA FUNCIÓN: Verificar si el usuario tiene contenido especial
async function verificarContenidoEspecial(request: NextRequest): Promise<boolean> {
  try {
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
  // 🔒 PROTECCIÓN: Rate limiting (15 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 15, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/filtros/productos');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  try {
    const url = new URL(request.url);
    const marcaIds = url.searchParams.get('marcas');
    const modelos = url.searchParams.get('modelos');

    if (!marcaIds) {
      return NextResponse.json({ 
        success: false,
        message: 'Se requieren IDs de marcas',
        productos: [] 
      });
    }

    const marcaIdsArray = marcaIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (marcaIdsArray.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'IDs de marcas inválidos',
        productos: [] 
      });
    }

    // ✅ VERIFICAR ACCESO A CONTENIDO ESPECIAL
    const tieneContenidoEspecial = await verificarContenidoEspecial(request);
    console.log(`🔒 Filtros Productos - Usuario tiene contenido especial: ${tieneContenidoEspecial}`);

    // ✅ BASE DE LA CONSULTA
    let sqlQuery = `
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
        CONCAT(m.nombre, ' ', a.modelo) AS marca_modelo_completo
      FROM articulos a
      INNER JOIN items i ON a.item_id = i.id
      INNER JOIN marcas m ON a.marca_id = m.id
      LEFT JOIN item_detalle d ON a.item_id = d.item_id
      WHERE i.disponible = 1
      AND a.marca_id IN (${marcaIdsArray.map(() => '?').join(',')})
    `;

    let parametros: (string | number)[] = [...marcaIdsArray];

    // ✅ AGREGAR FILTRO DE CONTENIDO ESPECIAL
    if (!tieneContenidoEspecial) {
      sqlQuery += ' AND (d.contenido_especial = 0 OR d.contenido_especial IS NULL)';
      console.log('🔒 Filtro de contenido especial aplicado - solo productos normales');
    } else {
      console.log('🔒 Usuario con acceso especial - mostrando todos los productos');
    }

    // Si hay modelos específicos seleccionados
    if (modelos && modelos.trim().length > 0) {
      const modelosArray = modelos.split(',').map(m => m.trim()).filter(m => m.length > 0);
      if (modelosArray.length > 0) {
        sqlQuery += ` AND a.modelo IN (${modelosArray.map(() => '?').join(',')})`;
        parametros.push(...modelosArray);
      }
    }

    sqlQuery += `
      HAVING stock_real > 0
      ORDER BY m.nombre, a.modelo, i.nombre
      LIMIT 100
    `;

    console.log(`🔍 Filtros Productos - Ejecutando consulta con ${parametros.length} parámetros`);

    const [rows]: any = await db.query(sqlQuery, parametros);

    console.log(`✅ Productos filtrados encontrados: ${rows.length}`);

    // ✅ LOG de productos especiales encontrados
    const productosEspeciales = rows.filter((row: any) => row.contenido_especial === 1);
    if (productosEspeciales.length > 0) {
      console.log(`🔒 Productos con contenido especial en resultados: ${productosEspeciales.length}`);
    }

    return NextResponse.json({ 
      success: true,
      productos: rows,
      total: rows.length,
      filtros: {
        marcas: marcaIdsArray,
        modelos: modelos ? modelos.split(',') : []
      },
      debug: {
        tieneContenidoEspecial,
        filtroContenidoAplicado: !tieneContenidoEspecial,
        productosEspeciales: productosEspeciales.length
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener productos filtrados:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}