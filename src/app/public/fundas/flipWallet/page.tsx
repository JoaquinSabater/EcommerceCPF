import { getCategorias, getMarcasConStock } from "@/data/data";
import { cookies } from 'next/headers';
import CategoriasPageClient from "@/components/Products/CategoriasPageClient";

export const dynamic = 'force-dynamic';

export default async function FlipWallet() {
  const subcategoriasIds = [8];
  
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
    const [categoriasResults, marcasResults] = await Promise.all([
      Promise.all(subcategoriasIds.map(id => getCategorias(id, tieneContenidoEspecial))),
      Promise.all(subcategoriasIds.map(id => getMarcasConStock(id)))
    ]);

    const categorias = categoriasResults.flat();
    categorias.sort((a, b) => (b.modelosDisponibles || 0) - (a.modelosDisponibles || 0));

    const marcasMap = new Map<number, { id: number; nombre: string }>();
    marcasResults.flat().forEach(m => marcasMap.set(m.id, m));
    const marcas = Array.from(marcasMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));

    return (
      <CategoriasPageClient
        categoriasIniciales={categorias}
        marcasIniciales={marcas}
        subcategoriasIds={subcategoriasIds}
        emptyMessage="No hay fundas Flip Wallet disponibles en este momento."
      />
    );
  } catch (error) {
    console.error('Error cargando categorías:', error);
    return (
      <CategoriasPageClient
        categoriasIniciales={[]}
        marcasIniciales={[]}
        subcategoriasIds={subcategoriasIds}
        emptyMessage="No hay fundas Flip Wallet disponibles en este momento."
      />
    );
  }
}