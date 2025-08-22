import { NextResponse } from 'next/server';
import { getPedidosByCliente } from '@/data/data';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clienteId = url.searchParams.get('clienteId');
    
    if (!clienteId) {
      return NextResponse.json(
        { error: 'Cliente ID requerido' },
        { status: 400 }
      );
    }

    const pedidos = await getPedidosByCliente(parseInt(clienteId));
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Error fetching pedidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los pedidos' },
      { status: 500 }
    );
  }
}