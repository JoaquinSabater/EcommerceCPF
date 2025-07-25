import { NextResponse } from 'next/server';
import { getDolar } from '@/data/data';

export async function GET() {
  const valor = await getDolar();
  return NextResponse.json({ dolar: valor });
}
