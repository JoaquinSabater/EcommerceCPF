import { NextResponse } from "next/server";
import { getDolarElectronica } from "@/data/data";

export async function GET() {
  try {
    const dolarElectronica = await getDolarElectronica();
    return NextResponse.json({ dolar: dolarElectronica });
  } catch (error) {
    console.error('Error obteniendo dólar electrónica:', error);
    return NextResponse.json({ dolar: 1 }, { status: 500 });
  }
}