'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useFilters } from '@/contexts/FiltersContext';
import { usePathname } from 'next/navigation';

export default function CollectionsDropdown() {
  const [open, setOpen] = useState(false);
  const { selectedMarca, setSelectedMarca, marcas, setMarcas } = useFilters();
  const pathname = usePathname();

  // Obtener subcategoriaId desde la URL (misma lógica que sidebar)
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
    setOpen(false);
  };

  return (
    <div className="md:hidden px-4 mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 text-black rounded hover:bg-neutral-200 border"
      >
        <span className="font-semibold">
          {selectedMarca ? selectedMarca.nombre : 'Todas las marcas'}
        </span>
        {open ? (
          <ChevronUpIcon className="h-5 w-5 text-black" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-black" />
        )}
      </button>

      {open && (
        <ul className="mt-2 rounded bg-white shadow-lg border">
          {/* Opción "Todas" */}
          <li>
            <button
              onClick={() => handleMarcaClick(null)}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                selectedMarca === null 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-black hover:text-orange-500 hover:bg-gray-50'
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
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                  selectedMarca?.id === marca.id 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-black hover:text-orange-500 hover:bg-gray-50'
                }`}
              >
                {marca.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}