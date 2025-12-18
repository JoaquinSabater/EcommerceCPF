import { NextRequest, NextResponse } from 'next/server';
import { updateItemContenidoEspecial } from '@/data/data';
import { requireAdmin, validateId } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // 🔒 PROTECCIÓN: Solo administradores pueden cambiar contenido especial de items
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { itemId, contenidoEspecial } = await request.json();

    const validItemId = validateId(itemId);
    if (!validItemId) {
      return NextResponse.json(
        { success: false, error: 'itemId es requerido' },
        { status: 400 }
      );
    }

    if (typeof contenidoEspecial !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'contenidoEspecial debe ser boolean' },
        { status: 400 }
      );
    }

    await updateItemContenidoEspecial(itemId, contenidoEspecial);
    
    return NextResponse.json({
      success: true,
      message: 'Contenido especial actualizado correctamente'
    });
  } catch (error) {
    console.error('Error actualizando contenido especial:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar contenido especial' 
      },
      { status: 500 }
    );
  }
}
