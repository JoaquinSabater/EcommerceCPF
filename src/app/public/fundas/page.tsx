'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import CategoriaCard from "@/components/Products/CategoriaCard";
import CategoriaCardSkeleton from "@/components/Skeletons/CategoriaCardSkeleton";
import { categorias } from '@/types/types';

interface Marca {
  id: number;
  nombre: string;
}

export default function Fundas() {
  const [categorias, setCategorias] = useState<categorias[]>([]);
  const [loading, setLoading] = useState(true);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingMarcas, setLoadingMarcas] = useState(true); // ✅ Nuevo estado para marcas
  
  const subcategoriasFundas = [11, 8, 10, 9]; // Diseño, FlipWallet, Lisas, Silicona

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        setLoadingMarcas(true); // ✅ Activar loading de marcas
        let todasMarcas: Marca[] = [];
        
        // Obtener marcas para cada subcategoría de fundas
        for (const subcategoriaId of subcategoriasFundas) {
          const response = await fetch(`/api/marcas?subcategoriaId=${subcategoriaId}`);
          const data = await response.json();
          
          if (data.success) {
            todasMarcas = [...todasMarcas, ...data.marcas];
          }
        }
        
        // Eliminar duplicados por ID
        const marcasUnicas = todasMarcas.filter((marca, index, self) => 
          index === self.findIndex(m => m.id === marca.id)
        );
        
        // Ordenar por nombre
        marcasUnicas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        setMarcas(marcasUnicas);
      } catch (error) {
        console.error('Error cargando marcas:', error);
      } finally {
        setLoadingMarcas(false); // ✅ Desactivar loading de marcas
      }
    };

    fetchMarcas();
  }, []);

  // ✅ Obtener categorías filtradas
  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      try {
        if (selectedMarca) {
          // Con marca seleccionada
          const promesas = subcategoriasFundas.map(subcategoriaId =>
            fetch(`/api/categorias-filtradas?subcategoriaId=${subcategoriaId}&marcaId=${selectedMarca.id}`)
              .then(res => res.json())
              .then(data => data.success ? data.categorias : [])
          );
          const resultados = await Promise.all(promesas);
          const todasCategorias = resultados.flat();
          setCategorias(todasCategorias);
        } else {
          // Sin marca - todas las categorías
          const promesas = subcategoriasFundas.map(subcategoriaId =>
            fetch(`/api/categorias-filtradas?subcategoriaId=${subcategoriaId}`)
              .then(res => res.json())
              .then(data => data.success ? data.categorias : [])
          );
          const resultados = await Promise.all(promesas);
          const todasCategorias = resultados.flat();
          setCategorias(todasCategorias);
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, [selectedMarca]);

  const handleMarcaClick = (marca: Marca | null) => {
    setSelectedMarca(marca);
    setDropdownOpen(false);
  };

  return (
    <div className="flex">
      {/* ✅ SIDEBAR DESKTOP con loading */}
      <aside className="hidden md:block w-48 px-4 pt-4">
        <h3 className="text-sm font-semibold uppercase mb-4" style={{ color: '#ff7100' }}>
          Marcas
        </h3>
        
        {loadingMarcas ? (
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
            {!loadingMarcas && marcas.length === 0 && (
              <li className="py-4 text-center">
                <p className="text-xs" style={{ color: '#d3d3d3' }}>
                  No hay marcas disponibles
                </p>
              </li>
            )}
          </ul>
        )}
      </aside>

      <main className="flex-1">
        {/* ✅ DROPDOWN MOBILE con loading */}
        <div className="md:hidden px-4 mt-4">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2 rounded border transition-colors"
            style={{ 
              color: '#1a1a1a',
              borderColor: '#d3d3d3'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 211, 211, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="font-semibold">
              {loadingMarcas ? 'Cargando marcas...' : (selectedMarca ? selectedMarca.nombre : 'Todas las marcas')}
            </span>
            {loadingMarcas ? (
              <div 
                className="animate-spin rounded-full h-4 w-4 border-b-2"
                style={{ borderColor: '#ff7100' }}
              ></div>
            ) : dropdownOpen ? (
              <ChevronUpIcon className="h-5 w-5" style={{ color: '#1a1a1a' }} />
            ) : (
              <ChevronDownIcon className="h-5 w-5" style={{ color: '#1a1a1a' }} />
            )}
          </button>

          {dropdownOpen && !loadingMarcas && (
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

        {/* ✅ CONTENIDO PRINCIPAL */}
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
                  <p style={{ color: '#d3d3d3' }} className="text-lg">
                    {selectedMarca 
                      ? `No hay fundas de ${selectedMarca.nombre} disponibles en este momento.`
                      : 'No hay fundas disponibles en este momento.'
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