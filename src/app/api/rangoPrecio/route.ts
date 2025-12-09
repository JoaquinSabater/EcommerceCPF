import { NextRequest, NextResponse } from "next/server";
import { getArticulosPorSubcategoria } from "@/data/data";
import { getRateLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // 🔒 PROTECCIÓN: Rate limiting (20 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 20, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/rangoPrecio');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  const { searchParams } = new URL(request.url);
  const itemId = Number(searchParams.get("itemId"));

  if (!itemId) {
    return NextResponse.json({ error: "itemId requerido" }, { status: 400 });
  }

  try {
    // ✅ Obtener todos los artículos de este item/categoría
    const articulos = await getArticulosPorSubcategoria(itemId);
    
    if (articulos.length === 0) {
      return NextResponse.json({ 
        precioMinimo: null,
        precioMaximo: null,
        tieneVariacion: false,
        totalArticulos: 0,
        articulosConPrecio: 0
      });
    }

    // ✅ Filtrar solo artículos con precio válido y stock
    const articulosConPrecio = articulos.filter(articulo => {
      const precio = Number(articulo.precio_venta || 0);
      const stock = Number(articulo.stock_real || 0);
      return precio > 0 && stock > 0;
    });

    if (articulosConPrecio.length === 0) {
      return NextResponse.json({ 
        precioMinimo: null,
        precioMaximo: null,
        tieneVariacion: false,
        totalArticulos: articulos.length,
        articulosConPrecio: 0
      });
    }

    // ✅ Extraer solo los precios para calcular min/max
    const precios = articulosConPrecio.map(articulo => Number(articulo.precio_venta || 0));
    
    const precioMinimo = Math.min(...precios);
    const precioMaximo = Math.max(...precios);
    const tieneVariacion = precioMinimo !== precioMaximo;

    // console.log(`💰 Rango calculado para item ${itemId}:`, {
    //   precioMinimo,
    //   precioMaximo,
    //   tieneVariacion,
    //   totalArticulos: articulos.length,
    //   articulosConPrecio: articulosConPrecio.length
    // });

    return NextResponse.json({ 
      precioMinimo,
      precioMaximo,
      tieneVariacion,
      totalArticulos: articulos.length,
      articulosConPrecio: articulosConPrecio.length
    });

  } catch (error) {
    console.error('Error obteniendo rango de precios:', error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}