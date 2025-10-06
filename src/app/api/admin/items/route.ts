import { NextResponse } from 'next/server';
import { getAllItems } from '@/data/data';

export async function GET() {
  try {
    const items = await getAllItems();
    
    return NextResponse.json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Error obteniendo items:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener items' 
      },
      { status: 500 }
    );
  }
}