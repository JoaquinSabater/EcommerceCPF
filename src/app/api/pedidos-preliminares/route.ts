// /api/pedidos-preliminares (en el CARRITO)
import { NextResponse } from 'next/server';
import { crearPedidoPreliminar } from '@/data/data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clienteId, itemsCarrito, observaciones } = body; // ✅ Removido vendedorId

    if (!clienteId || !itemsCarrito || itemsCarrito.length === 0) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    console.log('Creando pedido preliminar:', {
      clienteId,
      itemsCount: itemsCarrito.length
    });

    // 1. Crear el pedido en la BD compartida (la función obtiene el vendedorId automáticamente)
    const pedidoPreliminarId = await crearPedidoPreliminar(
      clienteId,
      itemsCarrito,
      observaciones
    );

    // ✅ Obtener el vendedorId real para el webhook
    const { db } = require('@/data/mysql');
    const [clienteResult] = await db.query(
      'SELECT vendedor_id FROM clientes WHERE id = ?',
      [clienteId]
    );
    
    const vendedorIdReal = clienteResult[0]?.vendedor_id;

    // 2. 🚀 NOTIFICAR AL CRM (datos mínimos)
    try {
      console.log('📤 Notificando al CRM...');
      
      // Ajusta la URL según donde esté tu CRM
      const crmUrl = process.env.CRM_WEBHOOK_URL || 'http://localhost:3000/api/webhooks';
      
      const webhookResponse = await fetch(crmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 1234567'
        },
        body: JSON.stringify({
          pedidoPreliminarId,
          vendedorId: vendedorIdReal, // ✅ Usar el vendedorId real del cliente
          clienteId,
          source: 'carrito',
          timestamp: new Date().toISOString()
        }),
      });

      if (webhookResponse.ok) {
        const result = await webhookResponse.json();
        console.log('✅ CRM notificado:', result.message);
      } else {
        const errorText = await webhookResponse.text();
        console.error('⚠️ Error notificando al CRM:', errorText);
      }
    } catch (webhookError) {
      console.error('❌ Error enviando webhook al CRM:', webhookError);
      // No fallar el proceso principal
    }

    return NextResponse.json({ 
      success: true, 
      pedidoPreliminarId,
      vendedorId: vendedorIdReal, // ✅ Devolver el vendedorId real
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