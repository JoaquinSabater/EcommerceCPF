// /api/pedidos-preliminares (en el CARRITO)
import { NextRequest, NextResponse } from 'next/server';
import { crearPedidoPreliminar } from '@/data/data';
import { requireAuth, validateId } from '@/lib/auth';
import { getActivePromotion } from '@/lib/promotions';
import { db } from '@/data/mysql';

export async function POST(request: NextRequest) {
  // 🔒 PROTECCIÓN: Verificar autenticación
  const authResult = requireAuth(request);
  if (authResult instanceof Response) return authResult;
  
  const { user } = authResult;

  try {
    const body = await request.json();
    const { clienteId, itemsCarrito, observaciones } = body;

    // Validar que el clienteId pertenece al usuario autenticado
    const validClienteId = validateId(clienteId);
    if (!validClienteId || validClienteId !== user.id) {
      console.warn('🚨 INTENTO DE CREAR PEDIDO PARA OTRO USUARIO:', {
        intentedClienteId: clienteId,
        authenticatedUserId: user.id,
        userName: `${user.nombre} ${user.apellido}`
      });
      return NextResponse.json(
        { error: 'No autorizado - ID de cliente inválido' },
        { status: 403 }
      );
    }

    if (!itemsCarrito || itemsCarrito.length === 0) {
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

    let promocionPedidosCount: number | null = null;
    const promoActiva = await getActivePromotion();

    if (promoActiva) {
      await db.query(
        `UPDATE clientes_auth
         SET promocion_pedidos_count = promocion_pedidos_count + 1
         WHERE cliente_id = ?
           AND promocion_pedidos_count < ?`,
        [clienteId, promoActiva.max_pedidos_por_cliente]
      );

      const [countRows]: any = await db.query(
        'SELECT promocion_pedidos_count FROM clientes_auth WHERE cliente_id = ?',
        [clienteId]
      );

      if (countRows.length > 0) {
        promocionPedidosCount = countRows[0].promocion_pedidos_count;
      }
    }

    return NextResponse.json({ 
      success: true, 
      pedidoPreliminarId,
      message: 'Pedido preliminar creado exitosamente',
      promocionPedidosCount
    });

} catch (error) {
  console.error('❌ Error creating pedido preliminar:', error);
  
  let errorMessage = 'Error al crear el pedido preliminar';
  
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      errorMessage = 'Tiempo de espera agotado. El servidor está saturado.';
    } else if (error.message.includes('Too many connections')) {
      errorMessage = 'Base de datos saturada. Intenta en unos minutos.';
    } else if (error.message.includes('Cliente no encontrado')) {
      errorMessage = 'Tu cuenta no fue encontrada. Contacta al administrador.';
    } else if (error.message.includes('no encontrado')) {
      errorMessage = 'Algunos productos ya no están disponibles.';
    }
  }
  
  return NextResponse.json(
    { error: errorMessage },
    { status: 500 }
  );
}
}