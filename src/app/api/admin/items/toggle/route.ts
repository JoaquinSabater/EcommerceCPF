import { NextResponse } from 'next/server';
import { updateItemDisponible } from '@/data/data';

export async function POST(request: Request) {
  try {
    const { itemId, disponible } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId es requerido' },
        { status: 400 }
      );
    }

    await updateItemDisponible(itemId, disponible);
    
    return NextResponse.json({
      success: true,
      message: 'Item actualizado correctamente'
    });
  } catch (error) {
    console.error('Error actualizando item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar item' 
      },
      { status: 500 }
    );
  }
}