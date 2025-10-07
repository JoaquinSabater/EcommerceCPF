import { NextRequest, NextResponse } from 'next/server';
import { getMarcasConStock } from '@/data/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subcategoriaId = searchParams.get('subcategoriaId');

    if (!subcategoriaId) {
      return NextResponse.json(
        { success: false, error: 'subcategoriaId es requerido' },
        { status: 400 }
      );
    }

    const marcas = await getMarcasConStock(parseInt(subcategoriaId));
    
    return NextResponse.json({
      success: true,
      marcas
    });
  } catch (error) {
    console.error('Error obteniendo marcas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener marcas' },
      { status: 500 }
    );
  }
}