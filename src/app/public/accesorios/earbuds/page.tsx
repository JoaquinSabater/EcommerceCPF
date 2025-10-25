import CollectionsSidebar from "@/components/Filters/CollectionsSidebar";
import CollectionsDropdown from "@/components/Filters/CollectionsDropdown";
import { getCategorias } from "@/data/data";
import CategoriaCard from "@/components/Products/CategoriaCard";
import CategoriaCardSkeleton from "@/components/Skeletons/CategoriaCardSkeleton";
export const dynamic = 'force-dynamic';

export default async function earbuds() {
  const subcategoriasEarbuds = [
    23   
  ];
  
  try {
    const promesasCategorias = subcategoriasEarbuds.map(subcategoriaId => 
      getCategorias(subcategoriaId)
    );
    
    const resultadosCategorias = await Promise.all(promesasCategorias);
    
    const todasLasCategorias = resultadosCategorias.flat();

    return (
      <div className="flex">
        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            {todasLasCategorias.map((cat) => (
              <CategoriaCard key={cat.id} categoria={cat} />
            ))}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error cargando categorías:', error);
    return (
      <div className="flex">
        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            {Array.from({ length: 6 }, (_, index) => (
              <CategoriaCardSkeleton key={index} />
            ))}
          </div>
        </main>
      </div>
    );
  }
}