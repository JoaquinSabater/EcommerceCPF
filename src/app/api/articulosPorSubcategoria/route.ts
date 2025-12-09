import { NextRequest, NextResponse } from "next/server";
import { getArticulosPorSubcategoria } from "@/data/data";
import { getRateLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // 🔒 PROTECCIÓN: Rate limiting (20 req/min)
  const rateLimiter = getRateLimiter();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const identifier = `api:${ip}`;
  
  if (!rateLimiter.check(identifier, 20, 60)) {
    console.warn('🚨 API BLOQUEADA - IP:', ip, '- Endpoint: /api/articulosPorSubcategoria');
    return NextResponse.json(
      { error: 'Demasiadas peticiones' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  const { searchParams } = new URL(request.url);
  const subcategoriaId = Number(searchParams.get("subcategoriaId"));

  if (!subcategoriaId) {
    return NextResponse.json({ error: "subcategoriaId requerido" }, { status: 400 });
  }

  const articulos = await getArticulosPorSubcategoria(subcategoriaId);
  return NextResponse.json({ articulos });
}