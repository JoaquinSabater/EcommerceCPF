'use client';

import { useEffect, useState } from 'react';
import { useFilters } from '@/contexts/FiltersContext';
import { usePathname } from 'next/navigation';

export default function CollectionsSidebar() {
  const { selectedMarca, setSelectedMarca, marcas, setMarcas } = useFilters();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

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
  };

  return (
    <aside className="hidden md:block w-48 px-4 pt-4">
      <h3 className="text-sm font-semibold uppercase mb-4" style={{ color: '#ff7100' }}>
        Marcas
      </h3>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div 
            className="animate-spin rounded-full h-6 w-6 border-b-2 mb-3"
            style={{ borderColor: '#ff7100' }}
          ></div>
          <p className="text-xs text-center" style={{ color: '#1a1a1a', opacity: 0.7 }}>
            Cargando marcas...
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {/* Opción "Todas" */}
          <li>
            <button
              onClick={() => handleMarcaClick(null)}
              className={`text-sm block w-full text-left transition-colors ${
                selectedMarca === null 
                  ? 'font-semibold' 
                  : 'hover:underline'
              }`}
              style={{
                color: selectedMarca === null ? '#ff7100' : '#1a1a1a'
              }}
              onMouseEnter={(e) => {
                if (selectedMarca !== null) {
                  e.currentTarget.style.color = '#ff7100';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMarca !== null) {
                  e.currentTarget.style.color = '#1a1a1a';
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
                className={`text-sm block w-full text-left transition-colors ${
                  selectedMarca?.id === marca.id 
                    ? 'font-semibold' 
                    : 'hover:underline'
                }`}
                style={{
                  color: selectedMarca?.id === marca.id ? '#ff7100' : '#1a1a1a'
                }}
                onMouseEnter={(e) => {
                  if (selectedMarca?.id !== marca.id) {
                    e.currentTarget.style.color = '#ff7100';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMarca?.id !== marca.id) {
                    e.currentTarget.style.color = '#1a1a1a';
                  }
                }}
              >
                {marca.nombre}
              </button>
            </li>
          ))}
          
          {/* Mensaje cuando no hay marcas */}
          {!loading && marcas.length === 0 && (
            <li className="py-4 text-center">
              <p className="text-xs" style={{ color: '#d3d3d3' }}>
                No hay marcas disponibles
              </p>
            </li>
          )}
        </ul>
      )}
    </aside>
  );
}