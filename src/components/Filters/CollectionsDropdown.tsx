'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useFilters } from '@/contexts/FiltersContext';
import { usePathname } from 'next/navigation';

export default function CollectionsDropdown() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    // ✅ Si las marcas ya fueron pre-cargadas desde el servidor, no re-fetchear
    if (marcas.length > 0) return;

    const subcategoriaId = getSubcategoriaId();
    if (!subcategoriaId) return;

    const fetchMarcas = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/marcas?subcategoriaId=${subcategoriaId}`);
        const data = await response.json();
        
        if (data.success) {
          setMarcas(data.marcas);
        }
      } catch (error) {
        console.error('Error cargando marcas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarcas();
  }, [pathname, setMarcas, marcas.length]);

  const handleMarcaClick = (marca: {id: number, nombre: string} | null) => {
    setSelectedMarca(marca);
    setOpen(false);
  };

  return (
    <div className="md:hidden px-4 mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 rounded border transition-colors"
        style={{ 
          color: '#1a1a1a',
          borderColor: '#d3d3d3'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 211, 211, 0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span className="font-semibold">
          {loading ? 'Cargando marcas...' : (selectedMarca ? selectedMarca.nombre : 'Todas las marcas')}
        </span>
        {loading ? (
          <div 
            className="animate-spin rounded-full h-4 w-4 border-b-2"
            style={{ borderColor: '#ff7100' }}
          ></div>
        ) : open ? (
          <ChevronUpIcon className="h-5 w-5" style={{ color: '#1a1a1a' }} />
        ) : (
          <ChevronDownIcon className="h-5 w-5" style={{ color: '#1a1a1a' }} />
        )}
      </button>

      {open && !loading && (
        <ul className="mt-2 rounded bg-white shadow-lg border" style={{ borderColor: '#d3d3d3' }}>
          {/* Opción "Todas" */}
          <li>
            <button
              onClick={() => handleMarcaClick(null)}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                selectedMarca === null 
                  ? 'font-semibold' 
                  : ''
              }`}
              style={{
                color: selectedMarca === null ? '#ff7100' : '#1a1a1a',
                backgroundColor: selectedMarca === null ? 'rgba(255, 113, 0, 0.1)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedMarca !== null) {
                  e.currentTarget.style.color = '#ff7100';
                  e.currentTarget.style.backgroundColor = 'rgba(211, 211, 211, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMarca !== null) {
                  e.currentTarget.style.color = '#1a1a1a';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
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
                    ? 'font-semibold' 
                    : ''
                }`}
                style={{
                  color: selectedMarca?.id === marca.id ? '#ff7100' : '#1a1a1a',
                  backgroundColor: selectedMarca?.id === marca.id ? 'rgba(255, 113, 0, 0.1)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (selectedMarca?.id !== marca.id) {
                    e.currentTarget.style.color = '#ff7100';
                    e.currentTarget.style.backgroundColor = 'rgba(211, 211, 211, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMarca?.id !== marca.id) {
                    e.currentTarget.style.color = '#1a1a1a';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {marca.nombre}
              </button>
            </li>
          ))}
          
          {/* Mensaje cuando no hay marcas */}
          {marcas.length === 0 && (
            <li className="px-4 py-3 text-center">
              <p className="text-sm" style={{ color: '#d3d3d3' }}>
                No hay marcas disponibles
              </p>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}