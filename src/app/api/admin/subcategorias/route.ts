import { NextResponse } from 'next/server';
import { getSubcategorias } from '@/data/data';

export async function GET() {
  try {
    const subcategorias = await getSubcategorias();
    
    return NextResponse.json({
      success: true,
      subcategorias
    });
  } catch (error) {
    console.error('Error obteniendo subcategorías:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener subcategorías' 
      },
      { status: 500 }
    );
  }
}