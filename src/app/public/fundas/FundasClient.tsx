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

interface FundasClientProps {
  categoriasIniciales: categorias[];
  marcasIniciales: Marca[];
  subcategoriasFundas: number[];
}

export default function FundasClient({ 
  categoriasIniciales, 
  marcasIniciales, 
  subcategoriasFundas 
}: FundasClientProps) {
  const [categorias, setCategorias] = useState<categorias[]>(categoriasIniciales);
  const [loading, setLoading] = useState(false);
  const [marcas] = useState<Marca[]>(marcasIniciales);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        const promesas = subcategoriasFundas.map(subcategoriaId =>
          fetch(`/api/categorias-filtradas?subcategoriaId=${subcategoriaId}&marcaId=${selectedMarca.id}`)
            .then(res => res.json())
            .then(data => data.success ? data.categorias : [])
        );
        const resultados = await Promise.all(promesas);
        const todasCategorias = resultados.flat();
        todasCategorias.sort((a: categorias, b: categorias) => 
          (b.modelosDisponibles || 0) - (a.modelosDisponibles || 0)
        );
        setCategorias(todasCategorias);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltradasPorMarca();
  }, [selectedMarca, categoriasIniciales, subcategoriasFundas]);

  const handleMarcaClick = (marca: Marca | null) => {
    setSelectedMarca(marca);
    setDropdownOpen(false);
  };

  return (
    <div className="flex">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:block w-48 px-4 pt-4">
        <h3 className="text-sm font-semibold uppercase mb-4" style={{ color: '#ff7100' }}>
          Marcas
        </h3>
        
        <ul className="space-y-2">
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
          
          {marcas.length === 0 && (
            <li className="py-4 text-center">
              <p className="text-xs" style={{ color: '#d3d3d3' }}>
                No hay marcas disponibles
              </p>
            </li>
          )}
        </ul>
      </aside>

      <main className="flex-1">
        {/* DROPDOWN MOBILE */}
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
              {selectedMarca ? selectedMarca.nombre : 'Todas las marcas'}
            </span>
            {dropdownOpen ? (
              <ChevronUpIcon className="h-5 w-5" style={{ color: '#1a1a1a' }} />
            ) : (
              <ChevronDownIcon className="h-5 w-5" style={{ color: '#1a1a1a' }} />
            )}
          </button>

          {dropdownOpen && (
            <ul className="mt-2 rounded bg-white shadow-lg border" style={{ borderColor: '#d3d3d3' }}>
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

        {/* CONTENIDO PRINCIPAL */}
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
