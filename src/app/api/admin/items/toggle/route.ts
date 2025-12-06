import { NextRequest, NextResponse } from 'next/server';
import { updateItemDisponible } from '@/data/data';
import { requireAdmin, validateId } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // 🔒 PROTECCIÓN: Solo administradores pueden cambiar disponibilidad de items
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { itemId, disponible } = await request.json();

    const validItemId = validateId(itemId);
    if (!validItemId) {
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