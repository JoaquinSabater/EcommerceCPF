import { NextRequest, NextResponse } from 'next/server';
import { getCategorias, getCategoriasPorMarca } from '@/data/data';

export async function GET(request: NextRequest) {
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

    let categorias;
    
    if (marcaId) {
      categorias = await getCategoriasPorMarca(parseInt(subcategoriaId), parseInt(marcaId));
    } else {
      categorias = await getCategorias(parseInt(subcategoriaId));
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