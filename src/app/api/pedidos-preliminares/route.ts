import { NextResponse } from 'next/server';
import { crearPedidoPreliminar } from '@/data/data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clienteId, vendedorId, itemsCarrito, observaciones } = body;

    // Validar datos requeridos
    if (!clienteId || !vendedorId || !itemsCarrito || itemsCarrito.length === 0) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    console.log('Creando pedido preliminar con sugerencias:', {
      clienteId,
      vendedorId,
      itemsCount: itemsCarrito.length,
      itemsWithSugerencias: itemsCarrito.filter((item: any) => item.sugerencia).length
    });

    const pedidoPreliminarId = await crearPedidoPreliminar(
      clienteId,
      vendedorId,
      itemsCarrito,
      observaciones
    );

    return NextResponse.json({ 
      success: true, 
      pedidoPreliminarId,
      message: 'Pedido preliminar creado exitosamente con sugerencias' 
    });

  } catch (error) {
    console.error('Error creating pedido preliminar:', error);
    return NextResponse.json(
      { error: 'Error al crear el pedido preliminar' },
      { status: 500 }
    );
  }
}