// /api/pedidos-preliminares (en el CARRITO)
import { NextResponse } from 'next/server';
import { crearPedidoPreliminar } from '@/data/data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clienteId, itemsCarrito, observaciones } = body;

    if (!clienteId || !itemsCarrito || itemsCarrito.length === 0) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    //console.log('Creando pedido preliminar:', {
      //clienteId,
      //itemsCount: itemsCarrito.length
    //});

    const pedidoPreliminarId = await crearPedidoPreliminar(
      clienteId,
      itemsCarrito,
      observaciones
    );

    return NextResponse.json({ 
      success: true, 
      pedidoPreliminarId,
      message: 'Pedido preliminar creado exitosamente' 
    });

  } catch (error) {
    console.error('Error creating pedido preliminar:', error);
    return NextResponse.json(
      { error: 'Error al crear el pedido preliminar' },
      { status: 500 }
    );
  }
}