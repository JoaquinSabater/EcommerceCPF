import { getCategorias } from "@/data/data";
import CategoriaCard from "@/components/Products/CategoriaCard";
import CategoriaCardSkeleton from "@/components/Skeletons/CategoriaCardSkeleton";
export const dynamic = 'force-dynamic';

export default async function Soportes() {
  const subcategoriaId = 30;
  
  try {
    const categorias = await getCategorias(subcategoriaId);

    return (
      <div className="flex">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categorias.map((cat) => (
                <CategoriaCard key={cat.id} categoria={cat} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error cargando categorías:', error);
    return (
      <div className="flex">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Soportes</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, index) => (
                <CategoriaCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }
}
