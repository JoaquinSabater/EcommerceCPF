import CollectionsSidebar from "@/components/Filters/CollectionsSidebar"; // Adjust the path as needed
import CollectionsDropdown from "@/components/Filters/CollectionsDropdown"; // Adjust the path as needed
import { getCategorias } from "@/data/data";
import CategoriaCard from "@/components/Products/CategoriaCard";
export const dynamic = 'force-dynamic';

export default async function Baterias() {
  const subcategoriaId = 4;
  const categorias = await getCategorias(subcategoriaId);

  return (
    <div className="flex">
      <CollectionsSidebar />
      <main className="flex-1">
        <CollectionsDropdown />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
          {categorias.map((cat) => (
            <CategoriaCard key={cat.id} categoria={cat} />
          ))}
        </div>
      </main>
    </div>
  );
}