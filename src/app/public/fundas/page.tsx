import { getCategorias, getMarcasConStock } from "@/data/data";
import { cookies } from 'next/headers';
import FundasClient from "./FundasClient";

export const dynamic = 'force-dynamic';

export default async function Fundas() {
  const subcategoriasFundas = [11, 8, 10, 9];

  let tieneContenidoEspecial = false;
  try {
    const cookieStore = await cookies();
    const authUserCookie = cookieStore.get('auth_user');
    const prospectoTokenCookie = cookieStore.get('prospecto_token');
    if (authUserCookie && !prospectoTokenCookie) {
      const userData = JSON.parse(decodeURIComponent(authUserCookie.value));
      tieneContenidoEspecial = userData.contenidoEspecial === 1;
    }
  } catch (error) {
    console.error('❌ Error leyendo cookies:', error);
  }

  try {
    // ✅ Ejecutar TODO en el servidor en paralelo (categorías + marcas)
    const [categoriasResults, marcasResults] = await Promise.all([
      Promise.all(subcategoriasFundas.map(id => getCategorias(id, tieneContenidoEspecial))),
      Promise.all(subcategoriasFundas.map(id => getMarcasConStock(id)))
    ]);

    const categorias = categoriasResults.flat();
    categorias.sort((a, b) => (b.modelosDisponibles || 0) - (a.modelosDisponibles || 0));

    // Deduplicar marcas
    const marcasMap = new Map<number, { id: number; nombre: string }>();
    marcasResults.flat().forEach(m => marcasMap.set(m.id, m));
    const marcas = Array.from(marcasMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));

    return (
      <FundasClient
        categoriasIniciales={categorias}
        marcasIniciales={marcas}
        subcategoriasFundas={subcategoriasFundas}
      />
    );
  } catch (error) {
    console.error('Error cargando fundas:', error);
    return (
      <FundasClient
        categoriasIniciales={[]}
        marcasIniciales={[]}
        subcategoriasFundas={subcategoriasFundas}
      />
    );
  }
}