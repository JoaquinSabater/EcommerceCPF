import { NextRequest, NextResponse } from 'next/server';
import { getActivePromotion, getPromotionSingleton, upsertPromotion, resetPromotionCounters } from '@/lib/promotions';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const activePromotion = await getActivePromotion();
    if (activePromotion) {
      return NextResponse.json({ active: true, promotion: activePromotion });
    }

    const lastPromotion = await getPromotionSingleton();
    return NextResponse.json({ active: false, promotion: lastPromotion });
  } catch (error) {
    console.error('Error obteniendo promociones:', error);
    return NextResponse.json(
      { error: 'Error al obtener la promoción' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const {
      nombre = 'Promo 5% del 21 al 31',
      descripcion = 'Descuento visual del 5% para los primeros 5 pedidos del cliente.',
      fecha_inicio,
      fecha_fin,
      descuento_percent = 5,
      max_pedidos_por_cliente = 5,
      activa = false,
      resetCounters = false
    } = body;

    if (!fecha_inicio || !fecha_fin) {
      return NextResponse.json(
        { error: 'Las fechas de inicio y fin son obligatorias' },
        { status: 400 }
      );
    }

    const promotion = await upsertPromotion({
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      descuento_percent,
      max_pedidos_por_cliente,
      activa
    });

    if (resetCounters) {
      await resetPromotionCounters();
    }

    return NextResponse.json({ success: true, promotion });
  } catch (error) {
    console.error('Error guardando promoción:', error);
    return NextResponse.json(
      { error: 'Error al guardar la promoción' },
      { status: 500 }
    );
  }
}
