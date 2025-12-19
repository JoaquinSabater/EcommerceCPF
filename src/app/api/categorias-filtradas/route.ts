import { NextRequest, NextResponse } from 'next/server';
import { getCategorias, getCategoriasPorMarca } from '@/data/data';
import { getRateLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // 🔒 PROTECCIÓN: Rate limiting (10 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 10, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/categorias-filtradas');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const subcategoriaId = searchParams.get('subcategoriaId');
    const marcaId = searchParams.get('marcaId');

    if (!subcategoriaId) {
      return NextResponse.json(
        { success: false, error: 'subcategoriaId es requerido' },
        { status: 400 }
      );
    }

    // ✅ Determinar si el usuario tiene contenido especial
    const authUserCookie = request.cookies.get('auth_user');
    const prospectoTokenCookie = request.cookies.get('prospecto_token');
    
    let tieneContenidoEspecial = false;
    
    if (authUserCookie && !prospectoTokenCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(authUserCookie.value));
        tieneContenidoEspecial = userData.contenidoEspecial === 1;
      } catch (error) {
        console.error('❌ Error parseando auth_user:', error);
      }
    }

    let categorias;
    
    if (marcaId) {
      categorias = await getCategoriasPorMarca(parseInt(subcategoriaId), parseInt(marcaId), tieneContenidoEspecial);
    } else {
      categorias = await getCategorias(parseInt(subcategoriaId), tieneContenidoEspecial);
    }
    
    return NextResponse.json({
      success: true,
      categorias
    });
  } catch (error) {
    console.error('Error obteniendo categorías filtradas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}