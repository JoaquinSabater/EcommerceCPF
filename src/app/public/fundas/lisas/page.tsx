import CollectionsSidebar from "@/components/Filters/CollectionsSidebar";
import CollectionsDropdown from "@/components/Filters/CollectionsDropdown";
import { getCategorias } from "@/data/data";
import CategoriaCard from "@/components/Products/CategoriaCard";
import CategoriaCardSkeleton from "@/components/Skeletons/CategoriaCardSkeleton";
export const dynamic = 'force-dynamic';

export default async function Lisas() {
  const subcategoriaId = 10;
  
  try {
    const categorias = await getCategorias(subcategoriaId);

    return (
      <div className="flex">
        <CollectionsSidebar />
        <main className="flex-1">
          <CollectionsDropdown />
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categorias.map((cat) => (
                <CategoriaCard key={cat.id} categoria={cat} />
              ))}
            </div>
            
            {categorias.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay fundas lisas disponibles en este momento.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error cargando categorías:', error);
    return (
      <div className="flex">
        <CollectionsSidebar />
        <main className="flex-1">
          <CollectionsDropdown />
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Fundas Lisas</h1>
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