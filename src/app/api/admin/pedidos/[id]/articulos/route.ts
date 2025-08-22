import { NextResponse } from 'next/server';
import { getArticulosDePedido } from '@/data/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedidoId = parseInt(id);
    if (isNaN(pedidoId)) {
      return NextResponse.json(
        { error: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    const articulos = await getArticulosDePedido(pedidoId);
    return NextResponse.json(articulos);
  } catch (error) {
    console.error('Error fetching artículos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los artículos del pedido' },
      { status: 500 }
    );
  }
}