import { NextResponse } from "next/server";
import { getArticulosPorSubcategoria } from "@/data/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subcategoriaId = Number(searchParams.get("subcategoriaId"));

  if (!subcategoriaId) {
    return NextResponse.json({ error: "subcategoriaId requerido" }, { status: 400 });
  }

  const articulos = await getArticulosPorSubcategoria(subcategoriaId);
  return NextResponse.json({ articulos });
}