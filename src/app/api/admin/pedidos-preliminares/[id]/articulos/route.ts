import { NextResponse } from 'next/server';
import { getArticulosDePedidoPreliminar } from '@/data/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedidoPreliminarId = parseInt(id);
    
    if (isNaN(pedidoPreliminarId)) {
      return NextResponse.json(
        { error: 'ID de pedido preliminar inválido' },
        { status: 400 }
      );
    }

    const articulos = await getArticulosDePedidoPreliminar(pedidoPreliminarId);
    return NextResponse.json(articulos);

  } catch (error) {
    console.error('Error fetching artículos de pedido preliminar:', error);
    return NextResponse.json(
      { error: 'Error al obtener los artículos del pedido preliminar' },
      { status: 500 }
    );
  }
}