import { NextResponse } from 'next/server';
import { getPedidosPreliminaresByCliente } from '@/data/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');

    if (!clienteId) {
      return NextResponse.json(
        { error: 'Cliente ID requerido' },
        { status: 400 }
      );
    }

    const pedidosPreliminares = await getPedidosPreliminaresByCliente(parseInt(clienteId));
    return NextResponse.json(pedidosPreliminares);

  } catch (error) {
    console.error('Error fetching pedidos preliminares:', error);
    return NextResponse.json(
      { error: 'Error al obtener los pedidos preliminares' },
      { status: 500 }
    );
  }
}