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
  
  const subcategoriasFundas = [11, 8, 10, 9]; // Diseño, FlipWallet, Lisas, Silicona

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
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
      {/* ✅ SIDEBAR DESKTOP */}
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

      <main className="flex-1">
        {/* ✅ DROPDOWN MOBILE */}
        <div className="md:hidden px-4 mt-4">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-black rounded hover:bg-neutral-200 border"
          >
            <span className="font-semibold">
              {selectedMarca ? selectedMarca.nombre : 'Todas las marcas'}
            </span>
            {dropdownOpen ? (
              <ChevronUpIcon className="h-5 w-5 text-black" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-black" />
            )}
          </button>

          {dropdownOpen && (
            <ul className="mt-2 rounded bg-white shadow-lg border">
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
                  <p className="text-gray-500 text-lg">
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