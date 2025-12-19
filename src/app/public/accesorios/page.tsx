import { getCategorias } from "@/data/data";
import CategoriaCard from "@/components/Products/CategoriaCard";
import CategoriaCardSkeleton from "@/components/Skeletons/CategoriaCardSkeleton";
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

export default async function Accesorios() {
  const subcategoriasAccesorios = [
    5,
    6,
    25 
  ];
  
  // ✅ Por defecto false (prospecto/cliente normal)
  let tieneContenidoEspecial = false;
  
  try {
    const cookieStore = await cookies();
    const authUserCookie = cookieStore.get('auth_user');
    const prospectoTokenCookie = cookieStore.get('prospecto_token');
    
    // Solo true si NO es prospecto Y tiene contenidoEspecial = 1
    if (authUserCookie && !prospectoTokenCookie) {
      const userData = JSON.parse(decodeURIComponent(authUserCookie.value));
      tieneContenidoEspecial = userData.contenidoEspecial === 1;
    }
  } catch (error) {
    console.error('❌ Error leyendo cookies:', error);
  }
  
  try {
    const promesasCategorias = subcategoriasAccesorios.map(subcategoriaId => 
      getCategorias(subcategoriaId, tieneContenidoEspecial)
    );
    
    const resultadosCategorias = await Promise.all(promesasCategorias);
    
    const todasLasCategorias = resultadosCategorias.flat();

    return (
      <div className="flex">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {todasLasCategorias.map((cat) => (
                <CategoriaCard key={cat.id} categoria={cat} />
              ))}
            </div>
            
            {todasLasCategorias.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay accesorios disponibles en este momento.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error cargando accesorios:', error);
    return (
      <div className="flex">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Accesorios</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }, (_, index) => (
                <CategoriaCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }
}