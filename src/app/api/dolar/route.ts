import { NextResponse } from 'next/server';
import { getDolar } from '@/data/data';

// ✅ OPTIMIZADO: Cache ISR de 1 hora (el dólar cambia poco)
export const revalidate = 3600;

export async function GET() {
  const valor = await getDolar();
  return NextResponse.json({ dolar: valor });
}
