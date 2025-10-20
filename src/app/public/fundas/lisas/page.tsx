'use client';

import { useState, useEffect } from 'react';
import CollectionsSidebar from "@/components/Filters/CollectionsSidebar";
import CollectionsDropdown from "@/components/Filters/CollectionsDropdown";
import CategoriaCard from "@/components/Products/CategoriaCard";
import CategoriaCardSkeleton from "@/components/Skeletons/CategoriaCardSkeleton";
import { FiltersProvider, useFilters } from '@/contexts/FiltersContext';
import { categorias } from '@/types/types';

function LisasContent() {
  const { selectedMarca } = useFilters();
  const [categorias, setCategorias] = useState<categorias[]>([]);
  const [loading, setLoading] = useState(true);
  // ✅ CAMBIO: Array con múltiples subcategorías
  const subcategoriasIds = [10, 22]; // Fundas lisas (10) + Protectores r original (22)

  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      try {
        // ✅ CAMBIO: Hacer múltiples requests para cada subcategoría
        const promises = subcategoriasIds.map(subcategoriaId => {
          const url = selectedMarca 
            ? `/api/categorias-filtradas?subcategoriaId=${subcategoriaId}&marcaId=${selectedMarca.id}`
            : `/api/categorias-filtradas?subcategoriaId=${subcategoriaId}`;
          return fetch(url);
        });

        const responses = await Promise.all(promises);
        const dataPromises = responses.map(response => response.json());
        const results = await Promise.all(dataPromises);
        
        // ✅ CAMBIO: Combinar resultados de todas las subcategorías
        const todasLasCategorias = results.reduce((acc, result) => {
          if (result.success) {
            return [...acc, ...result.categorias];
          }
          return acc;
        }, []);
        
        setCategorias(todasLasCategorias);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, [selectedMarca]); // ✅ CAMBIO: Quité subcategoriaId de las dependencias

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
                      ? `No hay productos de ${selectedMarca.nombre} disponibles en este momento.`
                      : 'No hay productos disponibles en este momento.'
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

export default function Lisas() {
  return (
    <FiltersProvider>
      <LisasContent />
    </FiltersProvider>
  );
}