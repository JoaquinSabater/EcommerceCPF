'use client';

import { useEffect } from 'react';
import { useFilters } from '@/contexts/FiltersContext';
import { usePathname } from 'next/navigation';

export default function CollectionsSidebar() {
  const { selectedMarca, setSelectedMarca, marcas, setMarcas } = useFilters();
  const pathname = usePathname();

  const getSubcategoriaId = () => {
    if (pathname.includes('/fundas/diseno')) return 11;
    if (pathname.includes('/fundas/silicona')) return 9;
    if (pathname.includes('/fundas/lisas')) return 10;
    if (pathname.includes('/fundas/flipWallet')) return 8;
    if (pathname.includes('/accesorios/popsockets')) return 5;
    if (pathname.includes('/accesorios/arosDeLuz')) return 6;
    if (pathname.includes('/accesorios/earbuds')) return 6;
    if (pathname.includes('/pantallas')) return 2;
    if (pathname.includes('/cables')) return 3;
    if (pathname.includes('/vidrios')) return 7;
    return null;
  };

  useEffect(() => {
    const subcategoriaId = getSubcategoriaId();
    if (!subcategoriaId) return;

    const fetchMarcas = async () => {
      try {
        const response = await fetch(`/api/marcas?subcategoriaId=${subcategoriaId}`);
        const data = await response.json();
        
        if (data.success) {
          setMarcas(data.marcas);
        }
      } catch (error) {
        console.error('Error cargando marcas:', error);
      }
    };

    fetchMarcas();
  }, [pathname, setMarcas]);

  const handleMarcaClick = (marca: {id: number, nombre: string} | null) => {
    setSelectedMarca(marca);
  };

  return (
    <aside className="hidden md:block w-48 px-4 pt-4">
      <h3 className="text-sm font-semibold uppercase mb-4 text-orange-600">
        Marcas
      </h3>
      <ul className="space-y-2">
        {/* Opción "Todas" */}
        <li>
          <button
            onClick={() => handleMarcaClick(null)}
            className={`text-sm block w-full text-left hover:text-orange-600 transition-colors ${
              selectedMarca === null 
                ? 'text-orange-600 font-semibold' 
                : 'text-black hover:underline'
            }`}
          >
            Todas las marcas
          </button>
        </li>
        
        {/* Marcas dinámicas */}
        {marcas.map((marca) => (
          <li key={marca.id}>
            <button
              onClick={() => handleMarcaClick(marca)}
              className={`text-sm block w-full text-left hover:text-orange-600 transition-colors ${
                selectedMarca?.id === marca.id 
                  ? 'text-orange-600 font-semibold' 
                  : 'text-black hover:underline'
              }`}
            >
              {marca.nombre}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}