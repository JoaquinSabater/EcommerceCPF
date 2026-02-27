'use client';

import { useState, useEffect } from 'react';
import CollectionsSidebar from "@/components/Filters/CollectionsSidebar";
import CollectionsDropdown from "@/components/Filters/CollectionsDropdown";
import CategoriaCard from "@/components/Products/CategoriaCard";
import CategoriaCardSkeleton from "@/components/Skeletons/CategoriaCardSkeleton";
import { FiltersProvider, useFilters } from '@/contexts/FiltersContext';
import { categorias } from '@/types/types';

interface CategoriasPageClientProps {
  categoriasIniciales: categorias[];
  marcasIniciales: { id: number; nombre: string }[];
  subcategoriasIds: number[];
  emptyMessage: string;
}

function CategoriasContent({ 
  categoriasIniciales, 
  marcasIniciales, 
  subcategoriasIds, 
  emptyMessage 
}: CategoriasPageClientProps) {
  const { selectedMarca, setMarcas } = useFilters();
  const [categorias, setCategorias] = useState<categorias[]>(categoriasIniciales);
  const [loading, setLoading] = useState(false);

  // ✅ Pre-cargar marcas en el contexto (ya vienen del servidor)
  useEffect(() => {
    if (marcasIniciales.length > 0) {
      setMarcas(marcasIniciales);
    }
  }, [marcasIniciales, setMarcas]);

  // ✅ Solo hacer fetch cuando el usuario filtra por marca
  useEffect(() => {
    if (!selectedMarca) {
      setCategorias(categoriasIniciales);
      setLoading(false);
      return;
    }

    const fetchFiltradasPorMarca = async () => {
      setLoading(true);
      try {
        const promises = subcategoriasIds.map(id =>
          fetch(`/api/categorias-filtradas?subcategoriaId=${id}&marcaId=${selectedMarca.id}`)
            .then(res => res.json())
            .then(data => data.success ? data.categorias : [])
        );
        const resultados = await Promise.all(promises);
        const todas = resultados.flat();
        todas.sort((a: categorias, b: categorias) => 
          (b.modelosDisponibles || 0) - (a.modelosDisponibles || 0)
        );
        setCategorias(todas);
      } catch (error) {
        console.error('Error cargando categorías filtradas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltradasPorMarca();
  }, [selectedMarca, categoriasIniciales, subcategoriasIds]);

  return (
    <div className="flex">
      <CollectionsSidebar />
      <main className="flex-1">
        <CollectionsDropdown />
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }, (_, index) => (
                <CategoriaCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categorias.map((cat) => (
                  <CategoriaCard key={cat.id} categoria={cat} />
                ))}
              </div>
              
              {categorias.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {selectedMarca 
                      ? `No hay ${emptyMessage.replace('No hay ', '').replace(' disponibles en este momento.', '')} de ${selectedMarca.nombre} disponibles en este momento.`
                      : emptyMessage
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CategoriasPageClient(props: CategoriasPageClientProps) {
  return (
    <FiltersProvider>
      <CategoriasContent {...props} />
    </FiltersProvider>
  );
}
